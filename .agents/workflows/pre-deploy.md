---
description: Pre-deploy validation for Asilo (retiro.bluejax.ai)
---

# Pre-Deploy Workflow

Run this before every deployment to catch critical issues.

## Steps

// turbo-all

1. Run the smoke test to verify UI infrastructure, pages, actions, and schema:
```
npm run smoke-test
```

2. Run the database integrity check:
```
npm run db-check
```

3. If DB issues are found, auto-fix:
```
npm run db-fix
```

4. Run the TypeScript compiler to catch type errors:
```
npx tsc --noEmit
```

5. If all checks pass, commit and push:
```
git add -A
git commit -m "chore: verified pre-deploy checks"
git push origin main
```

## What Each Test Catches

### smoke-test.js
- Missing `<Toaster />` component (was causing invisible form errors)
- Missing critical pages or server action exports
- Missing API route handlers
- Broken Prisma schema (missing models/fields)
- Auth JWT missing facilityId or role
- Missing environment variables

### db-check.js
- Tasks with null `facilityId` (was causing task start glitch)
- Users without `facilityId`
- Orphaned records (tasks → deleted users/patients)
- Expired invite tokens
- Missing facilities
