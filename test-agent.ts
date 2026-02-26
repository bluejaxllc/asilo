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

    console.log("Executing clinical-notes-synthesis agent...");
    const result = await registry.run('clinical-notes-synthesis');
    console.log("Agent Result:", result);

    console.log("\nChecking database for generated notes...");
    const latestNote = await db.dailyLog.findFirst({
        where: { type: 'NOTE' },
        orderBy: { createdAt: 'desc' },
        include: { patient: true }
    });

    if (latestNote && latestNote.value.includes("Error") === false) {
        console.log(`\nFound generated note for patient: ${latestNote.patient?.name}`);
        console.log(`Note Content:\n${latestNote.value}`);
    } else {
        console.log("No notes found in the database. Did the agent create one?");
    }
}

main().catch(console.error).finally(() => process.exit(0));
