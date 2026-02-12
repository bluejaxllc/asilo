import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPatients() {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`Total de residentes en la BD: ${patients.length}\n`);

        if (patients.length > 0) {
            console.log('Lista de residentes:');
            patients.forEach((patient, index) => {
                console.log(`${index + 1}. ${patient.name} - Room: ${patient.room || 'N/A'} - Status: ${patient.status}`);
            });
        } else {
            console.log('⚠️  No hay residentes en la base de datos');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPatients();
