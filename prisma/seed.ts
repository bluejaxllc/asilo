import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding massive demo data...')

    // --- 1. STAFF ---
    const password = await bcrypt.hash('123456', 10)

    // Core Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@asilo.com' },
        update: {},
        create: {
            email: 'admin@asilo.com',
            name: 'Administrador Demo',
            role: 'ADMIN',
            password,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        },
    })

    // Core Staff
    const staff = await prisma.user.upsert({
        where: { email: 'staff@asilo.com' },
        update: {},
        create: {
            email: 'staff@asilo.com',
            name: 'Carlos Cuidador',
            role: 'STAFF',
            password,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
        },
    })

    // Additional Kitchen Staff
    const kitchen = await prisma.user.upsert({
        where: { email: 'kitchen@asilo.com' },
        update: {},
        create: {
            email: 'kitchen@asilo.com',
            name: 'Chef Maria',
            role: 'KITCHEN',
            password,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chef'
        },
    })

    // Additional Nurses/Caregivers
    const extraStaffData = [
        { name: 'Ana Lopez', role: 'NURSE', email: 'ana@asilo.com' },
        { name: 'Pedro Martinez', role: 'STAFF', email: 'pedro@asilo.com' },
        { name: 'Luisa Fernanda', role: 'NURSE', email: 'luisa@asilo.com' },
        { name: 'Jorge Ramirez', role: 'CLEANING', email: 'jorge@asilo.com' },
        { name: 'Dr. Roberto Silva', role: 'DOCTOR', email: 'doctor@asilo.com' },
    ]

    const allStaff = [admin, staff, kitchen]
    for (const s of extraStaffData) {
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                email: s.email,
                name: s.name,
                role: s.role,
                password,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name.replace(' ', '')}`
            }
        })
        allStaff.push(user)
    }
    console.log(`Created ${allStaff.length} staff members.`)


    // --- 2. MEDICATIONS (INVENTORY) ---
    const medsData = [
        { name: 'Metformina 850mg', stock: 150, unit: 'tablets', minStock: 20 },
        { name: 'Losartán 50mg', stock: 80, unit: 'tablets', minStock: 15 },
        { name: 'Paracetamol 500mg', stock: 200, unit: 'tablets', minStock: 50 },
        { name: 'Omeprazol 20mg', stock: 60, unit: 'capsules', minStock: 10 },
        { name: 'Insulina Glargina', stock: 5, unit: 'pens', minStock: 3 }, // LOW STOCK ALERT
        { name: 'Aspirina Protect 100mg', stock: 90, unit: 'tablets', minStock: 30 },
        { name: 'Atorvastatina 20mg', stock: 45, unit: 'tablets', minStock: 10 },
        { name: 'Complejo B', stock: 12, unit: 'vials', minStock: 5 },
        { name: 'Gasas Estériles', stock: 100, unit: 'packs', minStock: 20 },
        { name: 'Jeringas 3ml', stock: 8, unit: 'pieces', minStock: 15 }, // LOW STOCK ALERT
        { name: 'Pañales Adulto M', stock: 40, unit: 'packs', minStock: 10 },
        { name: 'Pañales Adulto G', stock: 5, unit: 'packs', minStock: 10 }, // LOW STOCK ALERT
        { name: 'Suero Oral', stock: 25, unit: 'bottles', minStock: 5 },
        { name: 'Salbutamol Inhalador', stock: 6, unit: 'pieces', minStock: 2 },
        { name: 'Clonazepam Gotas', stock: 4, unit: 'bottles', minStock: 2 }
    ]

    // Clear existing meds to avoid dupes if running multiple times (optional, upsert is better but name isn't unique in schema usually)
    // For simplicity, we just create. In production, be careful.
    const createdMeds = []
    for (const m of medsData) {
        // Find first to avoid duplicates
        const existing = await prisma.medication.findFirst({ where: { name: m.name } })
        if (!existing) {
            const newMed = await prisma.medication.create({ data: m })
            createdMeds.push(newMed)
        } else {
            createdMeds.push(existing)
        }
    }
    console.log(`Inventory populated with ${createdMeds.length} items.`)


    // --- 3. RESIDENTS (PATIENTS) ---
    const residentsData = [
        { name: 'Maria Garcia', room: '101', status: 'Estable', age: 78, diet: 'Baja en Sodio', history: 'Hipertensión' },
        { name: 'Jose Hernandez', room: '102', status: 'Delicado', age: 82, diet: 'Diabético', history: 'Diabetes Tipo 2' },
        { name: 'Carmen Villalobos', room: '103', status: 'Estable', age: 85, diet: 'Normal', history: 'Alzheimer Leve' },
        { name: 'Roberto Gomez', room: '201', status: 'Recuperación', age: 74, diet: 'Alta Proteína', history: 'Post-Op Cadera' },
        { name: 'Elena Torres', room: '202', status: 'Estable', age: 91, diet: 'Suave / Papilla', history: 'Disfagia' },
        { name: 'Francisco Ruiz', room: '203', status: 'Hospitalizado', age: 88, diet: 'Sonda', history: 'Neumonía' },
        { name: 'Sofia Mendez', room: '104', status: 'Estable', age: 80, diet: 'Vegetariana', history: 'Artritis Reumatoide' },
        { name: 'Antonio Morales', room: '105', status: 'Estable', age: 76, diet: 'Normal', history: 'EPOC' },
        { name: 'Lucia Fernandez', room: '106', status: 'Delicado', age: 89, diet: 'Renal', history: 'Insuficiencia Renal' },
        { name: 'Miguel Angel', room: '204', status: 'Estable', age: 83, diet: 'Baja en Azúcar', history: 'Pre-diabetes' },
        { name: 'Ricardo Montaner', room: '205', status: 'Estable', age: 79, diet: 'Normal', history: 'Ninguna' },
        { name: 'Gloria Trevi', room: '206', status: 'Agitada', age: 84, diet: 'Normal', history: 'Demencia Senil' } // Fake celebs for fun/memorable demo
    ]

    const createdResidents = []
    for (const r of residentsData) {
        // Check existing name
        const existing = await prisma.patient.findFirst({ where: { name: r.name } })
        let pat;
        if (!existing) {
            pat = await prisma.patient.create({
                data: {
                    name: r.name,
                    room: r.room,
                    status: r.status,
                    age: r.age,
                    dietaryNeeds: r.diet,
                    medicalHistory: r.history
                }
            })
        } else {
            pat = existing
        }
        createdResidents.push(pat)
    }
    console.log(`Residents populated: ${createdResidents.length}`)


    // --- 4. TASKS ---
    const taskTitles = [
        'Toma de Glucosa', 'Aeso Matutino', 'Administrar Insulina', 'Caminata en Jardín',
        'Cambio de Ropa de Cama', 'Revisión de Signos Vitales', 'Asistencia en Comedor',
        'Terapia Ocupacional', 'Nebulización', 'Curación de Herida'
    ]

    // Create random tasks for Staff (Carlos) and Nurse (Ana)
    const targetStaff = [staff, allStaff.find(s => s.email === 'ana@asilo.com') || staff]

    for (let i = 0; i < 20; i++) {
        const randomStaff = targetStaff[Math.floor(Math.random() * targetStaff.length)]
        const randomPatient = createdResidents[Math.floor(Math.random() * createdResidents.length)]
        const randomTitle = taskTitles[Math.floor(Math.random() * taskTitles.length)]
        const isCompleted = Math.random() > 0.7 // 30% completed
        const isHighPriority = Math.random() > 0.8

        const dueDate = new Date()
        dueDate.setHours(8 + Math.floor(Math.random() * 10), 0, 0, 0) // Random time between 8am and 6pm

        await prisma.task.create({
            data: {
                title: `${randomTitle} - ${randomPatient.name.split(' ')[0]}`,
                description: `Realizar procedimiento estandar para ${randomPatient.name}.`,
                priority: isHighPriority ? 'HIGH' : 'NORMAL',
                status: isCompleted ? 'COMPLETED' : 'PENDING',
                assignedToId: randomStaff.id,
                dueDate
            }
        })
    }
    console.log('Tasks populated.')


    // --- 5. LOGS (BITÁCORA HISTORY) ---
    const logTypes = ['VITALS', 'FOOD', 'HYGIENE', 'INCIDENT', 'MEDS']
    const logNotes = [
        'Todo normal', 'Comió bien', 'Se negó a tomar medicamento', 'Presión un poco alta',
        'Durmió siesta', 'Visita de familiares', 'Pequeña tos', 'Buen estado de ánimo'
    ]

    for (let i = 0; i < 50; i++) {
        const randomPatient = createdResidents[Math.floor(Math.random() * createdResidents.length)]
        const randomStaff = allStaff[Math.floor(Math.random() * allStaff.length)]
        const randomType = logTypes[Math.floor(Math.random() * logTypes.length)]
        const randomNote = logNotes[Math.floor(Math.random() * logNotes.length)]

        // Random date in last 7 days
        const logDate = new Date()
        logDate.setDate(logDate.getDate() - Math.floor(Math.random() * 7))

        await prisma.dailyLog.create({
            data: {
                type: randomType,
                notes: randomNote,
                value: randomType === 'VITALS' ? '120/80' : undefined,
                patientId: randomPatient.id,
                authorId: randomStaff.id,
                createdAt: logDate
            }
        })
    }

    console.log('Seeding finished successfully. Massive demo data ready.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
