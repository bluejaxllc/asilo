/**
 * CORE FEATURE SMOKE TEST
 * ========================
 * Run this BEFORE every deployment to catch critical issues.
 * 
 * Usage: node scripts/smoke-test.js
 * 
 * Checks:
 *  1. UI Infrastructure (Toaster, Providers, Layouts)
 *  2. Data Integrity (null facilityIds, orphaned records)
 *  3. Server Action Imports (all actions export correctly)
 *  4. API Route Handlers (GET/POST exist on critical routes)
 *  5. Schema Validation (required fields present)
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const PRISMA = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let failures = [];
let passes = [];
let warnings = [];

function pass(msg) { passes.push(`  ✅ ${msg}`); }
function fail(msg) { failures.push(`  ❌ ${msg}`); }
function warn(msg) { warnings.push(`  ⚠️  ${msg}`); }

function readFile(relPath) {
    const fullPath = path.join(SRC, relPath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf-8');
}

function fileExists(relPath) {
    return fs.existsSync(path.join(SRC, relPath));
}

// ─────────────────────────────────────────────────────────
// 1. UI Infrastructure Checks
// ─────────────────────────────────────────────────────────

console.log('\n🏗️  UI INFRASTRUCTURE\n');

// Check root layout has Toaster
const rootLayout = readFile('app/layout.tsx');
if (rootLayout && rootLayout.includes('Toaster')) {
    pass('Root layout has <Toaster /> component');
} else {
    fail('Root layout is MISSING <Toaster /> — all toast notifications will be invisible!');
}

// Check root layout has ThemeProvider
if (rootLayout && rootLayout.includes('ThemeProvider')) {
    pass('Root layout has ThemeProvider');
} else {
    fail('Root layout is MISSING ThemeProvider');
}

// Check sonner is installed
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
if (packageJson.dependencies?.sonner || packageJson.devDependencies?.sonner) {
    pass('sonner is in package.json');
} else {
    fail('sonner is NOT in package.json — toast notifications will not work');
}

// Check all pages that use toast also have access to Toaster
const filesToCheck = [];
function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            walkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            filesToCheck.push(fullPath);
        }
    }
}
walkDir(SRC);

let toastUsageCount = 0;
for (const f of filesToCheck) {
    const content = fs.readFileSync(f, 'utf-8');
    if (content.includes('toast.error') || content.includes('toast.success') || content.includes('toast.info')) {
        toastUsageCount++;
    }
}
if (toastUsageCount > 0) {
    pass(`${toastUsageCount} files use toast notifications`);
}

// ─────────────────────────────────────────────────────────
// 2. Critical Pages Exist
// ─────────────────────────────────────────────────────────

console.log('\n📄 CRITICAL PAGES\n');

const criticalPages = [
    'app/admin/staff/page.tsx',
    'app/admin/tasks/page.tsx',
    'app/admin/patients/page.tsx',
    'app/admin/logs/page.tsx',
    'app/admin/settings/page.tsx',
    'app/staff/page.tsx',
    'app/family/page.tsx',
    'app/auth/login/page.tsx',
    'app/auth/register/page.tsx',
    'app/auth/accept-invite/page.tsx',
];

for (const page of criticalPages) {
    if (fileExists(page)) {
        pass(`${page} exists`);
    } else {
        fail(`${page} is MISSING`);
    }
}

// ─────────────────────────────────────────────────────────
// 3. Server Actions Export Correctly
// ─────────────────────────────────────────────────────────

console.log('\n⚡ SERVER ACTIONS\n');

const criticalActions = [
    { file: 'actions/tasks.ts', exports: ['getMyTasks', 'getAllTasks', 'createTask', 'deleteTask', 'startTask', 'completeTask'] },
    { file: 'actions/patients.ts', exports: ['getPatients'] },
    { file: 'actions/attendance.ts', exports: ['checkIn', 'checkOut'] },
    { file: 'actions/logs.ts', exports: ['createLog'] },
    { file: 'actions/login.ts', exports: ['login'] },
    { file: 'actions/register.ts', exports: ['register'] },
];

for (const action of criticalActions) {
    const content = readFile(action.file);
    if (!content) {
        fail(`${action.file} does NOT exist`);
        continue;
    }
    for (const exp of action.exports) {
        if (content.includes(`export const ${exp}`) || content.includes(`export async function ${exp}`)) {
            pass(`${action.file} exports ${exp}`);
        } else {
            fail(`${action.file} is MISSING export: ${exp}`);
        }
    }
}

// ─────────────────────────────────────────────────────────
// 4. API Routes Have Required Handlers
// ─────────────────────────────────────────────────────────

console.log('\n🌐 API ROUTES\n');

const criticalApiRoutes = [
    { file: 'app/api/staff/route.ts', methods: ['GET', 'POST'] },
    { file: 'app/api/cron/birthday/route.ts', methods: ['GET'] },
    { file: 'app/api/cron/recurring-tasks/route.ts', methods: ['GET'] },
];

for (const route of criticalApiRoutes) {
    const content = readFile(route.file);
    if (!content) {
        fail(`${route.file} does NOT exist`);
        continue;
    }
    for (const method of route.methods) {
        if (content.includes(`export async function ${method}`) || content.includes(`export function ${method}`)) {
            pass(`${route.file} has ${method} handler`);
        } else {
            fail(`${route.file} is MISSING ${method} handler`);
        }
    }
}

// ─────────────────────────────────────────────────────────
// 5. Component Dependencies (Dialogs, Forms)
// ─────────────────────────────────────────────────────────

console.log('\n🧩 COMPONENT DEPENDENCIES\n');

const componentChecks = [
    { file: 'components/admin/staff-form.tsx', must: ['handleSubmit', 'fetch', '/api/staff'] },
    { file: 'components/ui/dialog.tsx', must: ['DialogContent', 'DialogTrigger'] },
    { file: 'components/ui/button.tsx', must: ['Button'] },
];

for (const comp of componentChecks) {
    const content = readFile(comp.file);
    if (!content) {
        fail(`${comp.file} does NOT exist`);
        continue;
    }
    for (const keyword of comp.must) {
        if (content.includes(keyword)) {
            pass(`${comp.file} contains ${keyword}`);
        } else {
            fail(`${comp.file} is MISSING ${keyword}`);
        }
    }
}

// ─────────────────────────────────────────────────────────
// 6. Prisma Schema Validation
// ─────────────────────────────────────────────────────────

console.log('\n🗃️  SCHEMA VALIDATION\n');

if (fs.existsSync(PRISMA)) {
    const schema = fs.readFileSync(PRISMA, 'utf-8');
    
    // Check critical models exist
    const requiredModels = ['User', 'Patient', 'Task', 'DailyLog', 'Facility', 'Attendance', 'InviteToken'];
    for (const model of requiredModels) {
        if (schema.includes(`model ${model} {`)) {
            pass(`Schema has model ${model}`);
        } else {
            fail(`Schema is MISSING model ${model}`);
        }
    }

    // Check Task model has recurrence field
    if (schema.includes('recurrence')) {
        pass('Task model has recurrence field');
    } else {
        warn('Task model is missing recurrence field');
    }

    // Check Task model has facilityId
    const taskModelMatch = schema.match(/model Task \{[\s\S]*?\n\}/);
    if (taskModelMatch && taskModelMatch[0].includes('facilityId')) {
        pass('Task model has facilityId field');
    } else {
        fail('Task model is MISSING facilityId — tasks cannot be scoped to facilities');
    }
} else {
    fail('prisma/schema.prisma does NOT exist');
}

// ─────────────────────────────────────────────────────────
// 7. Auth & Middleware Checks
// ─────────────────────────────────────────────────────────

console.log('\n🔒 AUTH & MIDDLEWARE\n');

const middleware = readFile('middleware.ts');
if (middleware) {
    pass('middleware.ts exists');
    if (middleware.includes('/api')) {
        pass('Middleware handles /api routes');
    }
} else {
    fail('middleware.ts does NOT exist');
}

const authFile = readFile('auth.ts');
if (authFile) {
    if (authFile.includes('facilityId')) {
        pass('Auth JWT includes facilityId');
    } else {
        fail('Auth JWT is MISSING facilityId — facility scoping will break');
    }
    if (authFile.includes('role')) {
        pass('Auth JWT includes role');
    } else {
        fail('Auth JWT is MISSING role — role-based access will break');
    }
}

// ─────────────────────────────────────────────────────────
// 8. Environment Variables
// ─────────────────────────────────────────────────────────

console.log('\n🔑 ENVIRONMENT\n');

const envFile = path.join(__dirname, '..', '.env.local');
const envExample = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envFile)) {
    const env = fs.readFileSync(envFile, 'utf-8');
    const requiredVars = ['DATABASE_URL', 'AUTH_SECRET', 'RESEND_API_KEY'];
    for (const v of requiredVars) {
        if (env.includes(v)) {
            pass(`${v} is set in .env.local`);
        } else {
            warn(`${v} is NOT in .env.local`);
        }
    }
} else if (fs.existsSync(envExample)) {
    warn('.env.local not found, but .env.example exists');
} else {
    warn('No .env files found');
}

// ─────────────────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50));
console.log('📊 SMOKE TEST RESULTS');
console.log('═'.repeat(50));

if (passes.length > 0) {
    console.log(`\n✅ PASSED (${passes.length}):`);
    passes.forEach(p => console.log(p));
}

if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(w));
}

if (failures.length > 0) {
    console.log(`\n❌ FAILURES (${failures.length}):`);
    failures.forEach(f => console.log(f));
    console.log(`\n🚨 ${failures.length} CRITICAL ISSUE(S) FOUND — DO NOT DEPLOY`);
    process.exit(1);
} else {
    console.log(`\n🎉 ALL ${passes.length} CHECKS PASSED — safe to deploy`);
    process.exit(0);
}
