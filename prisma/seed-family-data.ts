import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🏥 Seeding family dashboard data for Maria Garcia...\n')

    // --- Find Maria Garcia (first patient, linked to familiar@asilo.com) ---
    const patient = await prisma.patient.findFirst({ where: { name: 'Maria Garcia' } })
    if (!patient) {
        console.error('❌ Maria Garcia not found. Run the main seed first.')
        return
    }
    console.log(`✅ Found patient: ${patient.name} (Room ${patient.room})`)

    // --- Find staff users for authoring logs ---
    const nurse = await prisma.user.findFirst({ where: { email: 'ana@asilo.com' } })
    const doctor = await prisma.user.findFirst({ where: { email: 'doctor@asilo.com' } })
    const staffCarlos = await prisma.user.findFirst({ where: { email: 'staff@asilo.com' } })
    const familyUser = await prisma.user.findFirst({ where: { email: 'familiar@asilo.com' } })

    if (!nurse || !doctor || !staffCarlos || !familyUser) {
        console.error('❌ Missing staff/family users. Run the main seed first.')
        return
    }

    // ============================================================
    // 1. ACTIVITY (DailyLog records for Maria Garcia)
    // ============================================================
    console.log('\n📋 Creating Activity logs...')

    // Clear old logs for this patient to avoid duplicates
    await prisma.dailyLog.deleteMany({ where: { patientId: patient.id } })

    const now = new Date()
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000)
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

    const activityLogs = [
        // Today
        { type: 'VITALS', value: '118/75', notes: 'Presión arterial normal, frecuencia cardíaca 72 bpm', authorId: nurse!.id, createdAt: hoursAgo(1) },
        { type: 'FOOD', value: 'Desayuno completo', notes: 'Avena con fruta, jugo de naranja. Comió todo.', authorId: staffCarlos!.id, createdAt: hoursAgo(3) },
        { type: 'MEDS', value: 'Administró Losartán 50mg', notes: 'Dosis matutina tomada sin problema', authorId: nurse!.id, createdAt: hoursAgo(4) },
        { type: 'ACTIVITY', value: 'Caminata matutina en el jardín', notes: '15 minutos de caminata asistida. Buen ánimo.', authorId: staffCarlos!.id, createdAt: hoursAgo(5) },

        // Yesterday
        { type: 'VITALS', value: '122/80', notes: 'Presión ligeramente elevada, se monitorea.', authorId: nurse!.id, createdAt: hoursAgo(26) },
        { type: 'FOOD', value: 'Almuerzo: Pollo con verduras', notes: 'Comió bien, dieta baja en sodio respetada.', authorId: staffCarlos!.id, createdAt: hoursAgo(28) },
        { type: 'MEDS', value: 'Administró Paracetamol 500mg', notes: 'Dolor leve de cabeza, se administró analgésico.', authorId: nurse!.id, createdAt: hoursAgo(30) },
        { type: 'ACTIVITY', value: 'Terapia ocupacional', notes: 'Participó en sesión grupal de manualidades. Excelente participación.', authorId: staffCarlos!.id, createdAt: hoursAgo(32) },
        { type: 'FOOD', value: 'Cena ligera', notes: 'Sopa de verduras y galletas. Comió 80%.', authorId: staffCarlos!.id, createdAt: hoursAgo(20) },
        { type: 'VITALS', value: '120/78', notes: 'Control nocturno. Todo normal.', authorId: nurse!.id, createdAt: hoursAgo(18) },

        // 2 days ago
        { type: 'VITALS', value: '125/82', notes: 'Presión un poco alta post-almuerzo. Normal para su condición.', authorId: doctor!.id, createdAt: hoursAgo(50) },
        { type: 'ACTIVITY', value: 'Visita de familiares', notes: 'Visita de su hija Ana Maria. Muy contenta y animada.', authorId: staffCarlos!.id, createdAt: hoursAgo(52) },
        { type: 'MEDS', value: 'Administró Losartán 50mg + Aspirina', notes: 'Dosis vespertina completa.', authorId: nurse!.id, createdAt: hoursAgo(44) },
        { type: 'FOOD', value: 'Desayuno: Licuado de frutas con tostadas', notes: 'Buen apetito hoy.', authorId: staffCarlos!.id, createdAt: hoursAgo(55) },

        // 3 days ago
        { type: 'VITALS', value: '120/80', notes: 'Signos vitales óptimos. Saturación 97%.', authorId: nurse!.id, createdAt: hoursAgo(72) },
        { type: 'MEDS', value: 'Administró Omeprazol 20mg', notes: 'Protector gástrico antes del desayuno.', authorId: nurse!.id, createdAt: hoursAgo(75) },
        { type: 'ACTIVITY', value: 'Ejercicios de estiramiento', notes: 'Sesión guiada de 20 min. Movilidad aceptable.', authorId: staffCarlos!.id, createdAt: hoursAgo(70) },

        // 4 days ago
        { type: 'VITALS', value: '115/72', notes: 'Excelente lectura hoy. Paciente relajada.', authorId: nurse!.id, createdAt: hoursAgo(96) },
        { type: 'FOOD', value: 'Comió todas las comidas del día', notes: 'Desayuno, almuerzo y cena completos.', authorId: staffCarlos!.id, createdAt: hoursAgo(90) },
        { type: 'ACTIVITY', value: 'Leyó en la sala de estar', notes: 'Pasó 1 hora leyendo. Tranquila y cómoda.', authorId: staffCarlos!.id, createdAt: hoursAgo(92) },
    ]

    for (const log of activityLogs) {
        await prisma.dailyLog.create({
            data: {
                type: log.type,
                value: log.value,
                notes: log.notes,
                patientId: patient.id,
                authorId: log.authorId,
                createdAt: log.createdAt,
            }
        })
    }
    console.log(`  ✅ Created ${activityLogs.length} activity logs`)

    // ============================================================
    // 2. MEDICATIONS (PatientMedication assignments)
    // ============================================================
    console.log('\n💊 Assigning medications...')

    // Clear old medication assignments for this patient
    await prisma.patientMedication.deleteMany({ where: { patientId: patient.id } })

    // Find medications (created by main seed)
    const losartan = await prisma.medication.findFirst({ where: { name: { contains: 'Losartán' } } })
    const paracetamol = await prisma.medication.findFirst({ where: { name: { contains: 'Paracetamol' } } })
    const omeprazol = await prisma.medication.findFirst({ where: { name: { contains: 'Omeprazol' } } })
    const aspirina = await prisma.medication.findFirst({ where: { name: { contains: 'Aspirina' } } })
    const complejoB = await prisma.medication.findFirst({ where: { name: { contains: 'Complejo B' } } })

    const medAssignments = [
        { medicationId: losartan?.id, dosage: '1 tableta cada 12 horas', schedule: '8:00 AM y 8:00 PM' },
        { medicationId: paracetamol?.id, dosage: '1 tableta si hay dolor', schedule: 'Según necesidad (máx 3/día)' },
        { medicationId: omeprazol?.id, dosage: '1 cápsula en ayunas', schedule: '7:00 AM antes del desayuno' },
        { medicationId: aspirina?.id, dosage: '1 tableta con el almuerzo', schedule: '1:00 PM' },
        { medicationId: complejoB?.id, dosage: '1 ampolla IM semanal', schedule: 'Lunes por la mañana' },
    ].filter(m => m.medicationId)

    for (const med of medAssignments) {
        await prisma.patientMedication.create({
            data: {
                patientId: patient.id,
                medicationId: med.medicationId!,
                dosage: med.dosage,
                schedule: med.schedule,
            }
        })
    }
    console.log(`  ✅ Assigned ${medAssignments.length} medications`)

    // ============================================================
    // 3. MESSAGES (FamilyMessage conversation)
    // ============================================================
    console.log('\n💬 Creating message conversation...')

    // Clear old messages for this patient
    await prisma.familyMessage.deleteMany({ where: { patientId: patient.id } })

    const messageConversation = [
        // 3 days ago
        { content: 'Buenos días, ¿cómo amaneció mi mamá hoy?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(72) },
        { content: 'Buenos días Ana María. Su mamá amaneció muy bien, desayunó todo y está de buen humor. 😊', isFromFamily: false, fromUserId: nurse!.id, createdAt: hoursAgo(71) },
        { content: 'Qué bueno saber eso. ¿Le tomaron la presión?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(70) },
        { content: 'Sí, la presión estuvo en 120/80, completamente normal. El doctor la revisó esta mañana.', isFromFamily: false, fromUserId: nurse!.id, createdAt: hoursAgo(69) },

        // 2 days ago
        { content: 'Hola, voy a pasar a visitarla mañana por la tarde. ¿Hay algo que necesite?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(48) },
        { content: 'Hola Ana María, claro que sí, la esperamos. Su mamá ha preguntado por usted. Si puede traer sus lentes de lectura, los dejó olvidados la última vez.', isFromFamily: false, fromUserId: staffCarlos!.id, createdAt: hoursAgo(47) },
        { content: 'Perfecto, los llevo sin falta. ¿A qué hora es mejor visitarla?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(46) },
        { content: 'Entre 3 y 5 PM es el mejor horario, después de su siesta. Así estará más activa y contenta con la visita.', isFromFamily: false, fromUserId: staffCarlos!.id, createdAt: hoursAgo(45) },

        // Yesterday
        { content: 'Gracias por la visita de ayer. Mi mamá estaba muy contenta. ¿Cómo durmió anoche?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(26) },
        { content: 'Durmió muy bien, 8 horas completas. Se nota que la visita la animó mucho. Hoy amaneció cantando. 🎶', isFromFamily: false, fromUserId: nurse!.id, createdAt: hoursAgo(25) },
        { content: '¡Qué lindo! Me da mucha alegría saber eso. ¿Hay cambios en su medicación?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(24) },
        { content: 'No, la medicación sigue igual. El Dr. Silva la revisará el viernes para su control mensual. Le informaremos cualquier cambio.', isFromFamily: false, fromUserId: doctor!.id, createdAt: hoursAgo(23) },

        // Today
        { content: 'Buenos días. ¿Cómo está hoy?', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(3) },
        { content: 'Buen día, Ana María. Su mamá desayunó muy bien hoy, avena con fruta. La presión está en 118/75, excelente. Ahora está tomando su caminata matutina en el jardín. 🌿', isFromFamily: false, fromUserId: nurse!.id, createdAt: hoursAgo(2) },
        { content: 'Muchas gracias por cuidarla tan bien. Son unos ángeles. 💕', isFromFamily: true, fromUserId: familyUser!.id, createdAt: hoursAgo(1) },
    ]

    for (const msg of messageConversation) {
        await prisma.familyMessage.create({
            data: {
                content: msg.content,
                isFromFamily: msg.isFromFamily,
                fromUserId: msg.fromUserId,
                patientId: patient.id,
                createdAt: msg.createdAt,
            }
        })
    }
    console.log(`  ✅ Created ${messageConversation.length} messages`)

    console.log('\n🎉 Family dashboard data seeded successfully!')
    console.log('   📋 Activity: 20 logs (VITALS, FOOD, MEDS, ACTIVITY)')
    console.log('   💊 Medications: 5 assigned (Losartán, Paracetamol, Omeprazol, Aspirina, Complejo B)')
    console.log('   💬 Messages: 15 message conversation thread')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
