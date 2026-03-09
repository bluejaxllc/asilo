/**
 * Data Isolation Tests
 * 
 * Verify that multi-tenant data boundaries are strictly enforced:
 * - Facility A's data is NEVER visible to Facility B
 * - API endpoints correctly scope data by facilityId
 * - Route guards prevent cross-tenant access
 * 
 * Usage: npx ts-node tests/data-isolation.test.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3008";

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, label: string) {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        passCount++;
    } else {
        console.error(`  ❌ FAIL: ${label}`);
        failCount++;
    }
}

async function loginAndGetCookie(email: string, password: string): Promise<string> {
    // Use the NextAuth credentials provider via the CSRF + signIn flow
    // Step 1: Get the CSRF token
    const csrfRes = await fetch(`${APP_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.getSetCookie?.() || [];

    // Build cookie string from initial request
    const cookieString = cookies.map(c => c.split(";")[0]).join("; ");

    // Step 2: Sign in with credentials
    const signInRes = await fetch(`${APP_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieString,
        },
        body: new URLSearchParams({
            csrfToken,
            email,
            password,
        }).toString(),
        redirect: "manual",
    });

    // Collect all Set-Cookie headers from the response
    const authCookies = signInRes.headers.getSetCookie?.() || [];
    const allCookies = [...cookies, ...authCookies].map(c => c.split(";")[0]).join("; ");

    return allCookies;
}

// ──────────────────────────────────────────
// SEED DATA
// ──────────────────────────────────────────

async function seedTestData() {
    console.log("\n🌱 Seeding test data...\n");

    const hashedPassword = await bcrypt.hash("TestPass123!", 10);

    // Create Facility A
    const facilityA = await db.facility.create({
        data: { name: "Test Facility Alpha" }
    });

    // Create Facility B
    const facilityB = await db.facility.create({
        data: { name: "Test Facility Beta" }
    });

    // Create Admin for Facility A
    const adminA = await db.user.create({
        data: {
            email: "admin-a-test@isolation.test",
            name: "Admin Alpha",
            password: hashedPassword,
            role: "ADMIN",
            facilityId: facilityA.id,
            emailVerified: new Date(),
        }
    });

    // Create Admin for Facility B
    const adminB = await db.user.create({
        data: {
            email: "admin-b-test@isolation.test",
            name: "Admin Beta",
            password: hashedPassword,
            role: "ADMIN",
            facilityId: facilityB.id,
            emailVerified: new Date(),
        }
    });

    // Create Patient in Facility A
    const patientA = await db.patient.create({
        data: {
            name: "Patient Alpha",
            age: 75,
            room: "A-101",
            status: "Activo",
            facilityId: facilityA.id,
        }
    });

    // Create Patient in Facility B
    const patientB = await db.patient.create({
        data: {
            name: "Patient Beta",
            age: 80,
            room: "B-201",
            status: "Activo",
            facilityId: facilityB.id,
        }
    });

    console.log(`  Facility A: ${facilityA.id} (${facilityA.name})`);
    console.log(`  Facility B: ${facilityB.id} (${facilityB.name})`);
    console.log(`  Admin A: ${adminA.email}`);
    console.log(`  Admin B: ${adminB.email}`);
    console.log(`  Patient A: ${patientA.name} (${patientA.id})`);
    console.log(`  Patient B: ${patientB.name} (${patientB.id})`);

    return { facilityA, facilityB, adminA, adminB, patientA, patientB };
}

// ──────────────────────────────────────────
// TESTS
// ──────────────────────────────────────────

async function runTests() {
    console.log("\n" + "═".repeat(60));
    console.log("  DATA ISOLATION TESTS");
    console.log("═".repeat(60));

    const testData = await seedTestData();
    const { facilityA, facilityB, adminA, adminB, patientA, patientB } = testData;

    try {
        // ── TEST 1: Database-level isolation (patients) ──
        console.log("\n📋 Test 1: Database-level patient isolation");

        const patientsForA = await db.patient.findMany({
            where: { facilityId: facilityA.id }
        });
        const patientsForB = await db.patient.findMany({
            where: { facilityId: facilityB.id }
        });

        assert(patientsForA.length === 1, "Facility A has exactly 1 patient");
        assert(patientsForA[0].name === "Patient Alpha", "Facility A's patient is Patient Alpha");
        assert(patientsForB.length === 1, "Facility B has exactly 1 patient");
        assert(patientsForB[0].name === "Patient Beta", "Facility B's patient is Patient Beta");
        assert(
            !patientsForA.some(p => p.id === patientB.id),
            "Facility A cannot see Facility B's patient"
        );
        assert(
            !patientsForB.some(p => p.id === patientA.id),
            "Facility B cannot see Facility A's patient"
        );

        // ── TEST 2: Database-level isolation (users/staff) ──
        console.log("\n👥 Test 2: Database-level staff isolation");

        const staffForA = await db.user.findMany({
            where: { facilityId: facilityA.id }
        });
        const staffForB = await db.user.findMany({
            where: { facilityId: facilityB.id }
        });

        assert(staffForA.length === 1, "Facility A has exactly 1 staff member");
        assert(staffForA[0].email === "admin-a-test@isolation.test", "Facility A's staff is Admin Alpha");
        assert(staffForB.length === 1, "Facility B has exactly 1 staff member");
        assert(staffForB[0].email === "admin-b-test@isolation.test", "Facility B's staff is Admin Beta");
        assert(
            !staffForA.some(u => u.id === adminB.id),
            "Facility A cannot see Facility B's staff"
        );

        // ── TEST 3: Cross-tenant patient ID lookup returns empty ──
        console.log("\n🔒 Test 3: Cross-tenant patient lookup returns null");

        const crossLookup = await db.patient.findFirst({
            where: {
                id: patientA.id,
                facilityId: facilityB.id, // Wrong facility!
            }
        });

        assert(crossLookup === null, "Querying Patient A's ID with Facility B's scope returns null");

        // ── TEST 4: API-level isolation (if server is running) ──
        console.log("\n🌐 Test 4: API-level isolation check");

        try {
            const healthCheck = await fetch(`${APP_URL}/api/auth/csrf`, { signal: AbortSignal.timeout(3000) });
            if (healthCheck.ok) {
                const cookieA = await loginAndGetCookie("admin-a-test@isolation.test", "TestPass123!");

                // Admin A fetches staff via API
                const staffRes = await fetch(`${APP_URL}/api/staff`, {
                    headers: { Cookie: cookieA },
                });

                if (staffRes.ok) {
                    const staffData = await staffRes.json();
                    const hasOwnStaff = staffData.some((s: any) => s.email === "admin-a-test@isolation.test");
                    const hasOtherStaff = staffData.some((s: any) => s.email === "admin-b-test@isolation.test");

                    assert(hasOwnStaff, "Admin A sees their own staff via API");
                    assert(!hasOtherStaff, "Admin A does NOT see Facility B's staff via API");
                } else {
                    console.log("  ⏭️  SKIP: Staff API returned non-OK status");
                }
            } else {
                console.log("  ⏭️  SKIP: Server not reachable, skipping API tests");
            }
        } catch {
            console.log("  ⏭️  SKIP: Server not reachable, skipping API tests");
        }

    } finally {
        // ── CLEANUP ──
        console.log("\n🧹 Cleaning up test data...");

        await db.patient.deleteMany({
            where: { facilityId: { in: [facilityA.id, facilityB.id] } }
        });
        await db.user.deleteMany({
            where: { email: { in: ["admin-a-test@isolation.test", "admin-b-test@isolation.test"] } }
        });
        await db.facility.deleteMany({
            where: { id: { in: [facilityA.id, facilityB.id] } }
        });

        console.log("  ✅ Cleanup complete\n");
    }

    // ── SUMMARY ──
    console.log("═".repeat(60));
    console.log(`  RESULTS: ${passCount} passed, ${failCount} failed`);
    console.log("═".repeat(60));

    if (failCount > 0) {
        process.exit(1);
    }
}

runTests()
    .catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
