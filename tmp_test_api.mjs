const testApi = async () => {
    console.log('--- Testing API Security Fixes ---');

    console.log('\n1. Testing POST /api/antigravity/run (without secret, expecting 401)');
    try {
        const res1 = await fetch('https://retiro.bluejax.ai/api/antigravity/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: 'test-agent' })
        });
        console.log(`Status: ${res1.status}`);
        console.log(`Body:`, await res1.json());
    } catch (e) { console.error(e); }

    console.log('\n2. Testing POST /api/staff (without auth/role, expecting 403 or 401)');
    try {
        const res2 = await fetch('https://retiro.bluejax.ai/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Hacker', email: 'hacker@test.com', role: 'ADMIN' })
        });
        console.log(`Status: ${res2.status}`);
        console.log(`Body:`, await res2.text());
    } catch (e) { console.error(e); }
};
testApi();
