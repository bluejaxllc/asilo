import { getRegistry } from './src/agents/core/registry';
import { db } from './src/lib/db';

async function main() {
    console.log("Fetching registry...");
    const registry = getRegistry();

    console.log("Seeding mock vitals for recent 48h...");
    const patient = await db.patient.findFirst();
    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (patient && admin) {
        await db.dailyLog.createMany({
            data: [
                { type: 'VITALS', value: '140/90', notes: 'Presión alta', patientId: patient.id, authorId: admin.id },
                { type: 'VITALS', value: '145/95', notes: 'Presión sigue alta', patientId: patient.id, authorId: admin.id },
                { type: 'VITALS', value: '150/100', notes: 'Dolor de cabeza leve', patientId: patient.id, authorId: admin.id },
                { type: 'INCIDENT', notes: 'Mareo al levantarse', patientId: patient.id, authorId: admin.id },
            ]
        });
        console.log(`Inserted 4 mock logs for ${patient.name}`);
    }

    console.log("Executing marketing-audit agent...");
    const mktResult = await registry.run('marketing-audit');
    console.log("Marketing Agent Result:", mktResult);

    console.log("\nExecuting low-stock-monitor agent...");
    const stockResult = await registry.run('low-stock-monitor');
    console.log("Low Stock Agent Result:", stockResult);

    console.log("\nExecuting reputation-audit agent...");
    const repResult = await registry.run('reputation-audit');
    console.log("Reputation Agent Result:", repResult);

    console.log("\nChecking database for generated notifications...");
    const latestNotifications = await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    for (const notif of latestNotifications) {
        console.log(`\n[${notif.type}] ${notif.title}\n${notif.message}`);
    }
}

main().catch(console.error).finally(() => process.exit(0));
