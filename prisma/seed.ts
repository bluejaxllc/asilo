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


    // --- 3.5 FAMILY USER ---
    const firstPatient = createdResidents[0]
    const familyUser = await prisma.user.upsert({
        where: { email: 'familiar@asilo.com' },
        update: { patientId: firstPatient.id },
        create: {
            email: 'familiar@asilo.com',
            name: 'Ana Maria Garcia (Hija)',
            role: 'FAMILY',
            password,
            patientId: firstPatient.id,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FamilyAna'
        },
    })
    console.log(`Family user created: ${familyUser.email} → linked to ${firstPatient.name}`)


    // --- 4. TASKS (Role-Specific) ---
    // Clear existing tasks to avoid duplicates on re-seed
    await prisma.task.deleteMany({})

    // Role-specific task definitions
    const roleTaskMap: Record<string, { titles: string[]; descriptions: string[] }> = {
        NURSE: {
            titles: [
                'Toma de glucosa',
                'Administrar insulina',
                'Revisión de signos vitales',
                'Nebulización',
                'Curación de herida',
                'Cambio de vendajes',
                'Aplicar inyección intramuscular',
            ],
            descriptions: [
                'Medir niveles de glucosa en sangre y registrar en expediente.',
                'Aplicar dosis prescrita de insulina según indicación médica.',
                'Medir presión arterial, frecuencia cardíaca y temperatura.',
                'Realizar sesión de nebulización con salbutamol según prescripción.',
                'Limpiar y curar herida quirúrgica. Revisar signos de infección.',
                'Cambiar vendajes y revisar evolución de la zona afectada.',
                'Aplicar medicamento inyectable según orden médica.',
            ],
        },
        STAFF: {
            titles: [
                'Aseo matutino',
                'Caminata en jardín',
                'Cambio de ropa de cama',
                'Asistencia en comedor',
                'Terapia ocupacional',
                'Acompañar a cita médica',
                'Actividad recreativa',
            ],
            descriptions: [
                'Asistir al residente con su higiene personal matutina.',
                'Acompañar al residente en caminata por el jardín (15-20 min).',
                'Cambiar sábanas, fundas y cobijas de la cama del residente.',
                'Acompañar y asistir al residente durante el horario de comida.',
                'Facilitar actividad de terapia ocupacional (manualidades, lectura).',
                'Acompañar al residente a su cita médica programada.',
                'Organizar juego de mesa o actividad grupal con residentes.',
            ],
        },
        KITCHEN: {
            titles: [
                'Preparar desayuno',
                'Preparar comida',
                'Preparar cena',
                'Revisar inventario de alimentos',
                'Preparar dietas especiales',
                'Desinfectar cocina',
                'Preparar colaciones',
            ],
            descriptions: [
                'Preparar desayuno para todos los residentes según menú del día.',
                'Cocinar comida principal respetando dietas individuales.',
                'Preparar cena ligera para todos los residentes.',
                'Verificar stock de perecederos y reportar faltantes al admin.',
                'Preparar platos especiales: dieta baja en sodio, diabética, renal, suave.',
                'Limpieza profunda y desinfección de todas las superficies de cocina.',
                'Preparar refrigerios de media mañana y media tarde.',
            ],
        },
        CLEANING: {
            titles: [
                'Limpieza de habitaciones',
                'Desinfección de baños',
                'Lavado de ropa de cama',
                'Limpieza de áreas comunes',
                'Recolección de basura',
                'Sanitización de comedor',
            ],
            descriptions: [
                'Barrer, trapear y desinfectar habitaciones asignadas.',
                'Limpiar y desinfectar baños de residentes con productos antibacteriales.',
                'Recoger, lavar y secar ropa de cama de las habitaciones.',
                'Limpiar sala de TV, pasillos y recepción.',
                'Recolectar y clasificar basura de todas las áreas del asilo.',
                'Limpiar mesas, sillas y piso del comedor después de cada comida.',
            ],
        },
        DOCTOR: {
            titles: [
                'Ronda médica matutina',
                'Revisión de expedientes',
                'Consulta individual',
                'Actualizar tratamiento',
                'Valoración de ingreso',
                'Revisión de laboratorios',
            ],
            descriptions: [
                'Realizar visita a cada residente para evaluar estado general.',
                'Revisar y actualizar expedientes médicos de residentes.',
                'Consulta detallada con el residente: evaluación y ajuste de tratamiento.',
                'Modificar dosis o medicamentos según evolución del paciente.',
                'Realizar valoración médica completa a nuevo residente.',
                'Interpretar resultados de laboratorio y actualizar diagnósticos.',
            ],
        },
    }

    const statuses = ['PENDING', 'PENDING', 'PENDING', 'IN_PROGRESS', 'COMPLETED']
    const priorities = ['NORMAL', 'NORMAL', 'NORMAL', 'HIGH', 'URGENT']

    for (const staffMember of allStaff) {
        const roleTasks = roleTaskMap[staffMember.role]
        if (!roleTasks) continue // Skip ADMIN and FAMILY — they don't have operational tasks

        const taskCount = Math.min(roleTasks.titles.length, 5 + Math.floor(Math.random() * 3)) // 5-7 tasks

        for (let i = 0; i < taskCount; i++) {
            const randomPatient = createdResidents[Math.floor(Math.random() * createdResidents.length)]
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            const priority = priorities[Math.floor(Math.random() * priorities.length)]

            // Spread due dates across today and next 3 days
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 4))
            dueDate.setHours(7 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 4) * 15, 0, 0)

            await prisma.task.create({
                data: {
                    title: `${roleTasks.titles[i]} - ${randomPatient.name.split(' ')[0]}`,
                    description: roleTasks.descriptions[i],
                    priority,
                    status,
                    assignedToId: staffMember.id,
                    patientId: randomPatient.id,
                    dueDate,
                },
            })
        }
    }
    console.log('Role-specific tasks populated.')


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
