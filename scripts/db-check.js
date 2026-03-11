/**
 * DATABASE INTEGRITY CHECK
 * =========================
 * Run this BEFORE every deployment to catch data issues.
 * 
 * Usage: node scripts/db-check.js
 * 
 * Checks:
 *  1. Tasks with null facilityId (was root cause of task start glitch)
 *  2. Users without facilityId
 *  3. Orphaned records (tasks pointing to deleted patients/users)
 *  4. Pending invites that expired
 */

const { PrismaClient } = require('../node_modules/@prisma/client');
const db = new PrismaClient();

let failures = [];
let passes = [];
let warnings = [];
let fixes = 0;

function pass(msg) { passes.push(`  ✅ ${msg}`); }
function fail(msg) { failures.push(`  ❌ ${msg}`); }
function warn(msg) { warnings.push(`  ⚠️  ${msg}`); }

async function main() {
    console.log('\n🗃️  DATABASE INTEGRITY CHECK\n');

    // ── 1. Tasks with null facilityId ──
    const nullFacilityTasks = await db.task.count({ where: { facilityId: null } });
    if (nullFacilityTasks > 0) {
        fail(`${nullFacilityTasks} tasks have NULL facilityId — task start/complete will fail`);
        
        // Auto-fix if possible
        const defaultFacility = await db.facility.findFirst();
        if (defaultFacility && process.argv.includes('--fix')) {
            const result = await db.task.updateMany({
                where: { facilityId: null },
                data: { facilityId: defaultFacility.id }
            });
            console.log(`  🔧 AUTO-FIXED: Set ${result.count} tasks to facility "${defaultFacility.name}"`);
            fixes += result.count;
        }
    } else {
        pass('All tasks have a facilityId');
    }

    // ── 2. Staff users without facilityId ──
    const nullFacilityUsers = await db.user.count({
        where: { facilityId: null, role: { notIn: ['SUPER_ADMIN'] } }
    });
    if (nullFacilityUsers > 0) {
        fail(`${nullFacilityUsers} users have NULL facilityId — they can't access any data`);
    } else {
        pass('All users have a facilityId');
    }

    // ── 3. Tasks assigned to non-existent users ──
    const allTasks = await db.task.findMany({
        where: { assignedToId: { not: null } },
        select: { id: true, title: true, assignedToId: true }
    });
    let orphanedTasks = 0;
    for (const task of allTasks) {
        const user = await db.user.findUnique({ where: { id: task.assignedToId } });
        if (!user) {
            orphanedTasks++;
            warn(`Task "${task.title}" assigned to deleted user ${task.assignedToId}`);
        }
    }
    if (orphanedTasks === 0) {
        pass('No tasks assigned to non-existent users');
    }

    // ── 4. Tasks pointing to non-existent patients ──
    const patientTasks = await db.task.findMany({
        where: { patientId: { not: null } },
        select: { id: true, title: true, patientId: true }
    });
    let orphanedPatientTasks = 0;
    for (const task of patientTasks) {
        const patient = await db.patient.findUnique({ where: { id: task.patientId } });
        if (!patient) {
            orphanedPatientTasks++;
            warn(`Task "${task.title}" references deleted patient ${task.patientId}`);
        }
    }
    if (orphanedPatientTasks === 0) {
        pass('No tasks reference non-existent patients');
    }

    // ── 5. Expired invites cleanup ──
    const expiredInvites = await db.inviteToken.count({
        where: { expires: { lt: new Date() } }
    });
    if (expiredInvites > 0) {
        warn(`${expiredInvites} expired invite tokens could be cleaned up`);
        if (process.argv.includes('--fix')) {
            const del = await db.inviteToken.deleteMany({
                where: { expires: { lt: new Date() } }
            });
            console.log(`  🔧 AUTO-FIXED: Deleted ${del.count} expired invites`);
            fixes += del.count;
        }
    } else {
        pass('No expired invite tokens');
    }

    // ── 6. Facility exists ──
    const facilityCount = await db.facility.count();
    if (facilityCount > 0) {
        pass(`${facilityCount} facility/facilities exist`);
    } else {
        fail('NO facilities exist — the app will not work');
    }

    // ── RESULTS ──
    console.log('\n' + '═'.repeat(50));
    console.log('📊 DATABASE CHECK RESULTS');
    console.log('═'.repeat(50));

    if (passes.length > 0) {
        console.log(`\n✅ PASSED (${passes.length}):`);
        passes.forEach(p => console.log(p));
    }

    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
        warnings.forEach(w => console.log(w));
    }

    if (fixes > 0) {
        console.log(`\n🔧 AUTO-FIXED: ${fixes} issues`);
    }

    if (failures.length > 0) {
        console.log(`\n❌ FAILURES (${failures.length}):`);
        failures.forEach(f => console.log(f));
        console.log(`\n💡 Run with --fix to auto-repair: node scripts/db-check.js --fix`);
        console.log(`\n🚨 ${failures.length} CRITICAL DATA ISSUE(S) — features may be broken`);
    } else {
        console.log(`\n🎉 ALL ${passes.length} CHECKS PASSED — database is healthy`);
    }
}

main()
    .catch(e => { console.error('Fatal error:', e); process.exit(1); })
    .finally(() => db.$disconnect());
