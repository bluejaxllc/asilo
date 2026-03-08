// Seed script for premium services and facility linking
// Run with: npx tsx prisma/seed-premium.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🏗️  Seeding facility + premium services...')

    // 1. Create or update a demo facility
    const facility = await prisma.facility.upsert({
        where: { id: 'demo-facility-001' },
        update: { name: 'Retiro Demo - Estancia para el Adulto Mayor', plan: 'CORE' },
        create: {
            id: 'demo-facility-001',
            name: 'Retiro Demo - Estancia para el Adulto Mayor',
            plan: 'CORE',
        },
    })
    console.log(`✅ Facility: ${facility.name} (${facility.id})`)

    // 2. Link all existing users to this facility
    const users = await prisma.user.findMany()
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { facilityId: facility.id }
        })
    }
    console.log(`✅ Linked ${users.length} users to facility`)

    // 3. Link all existing patients to this facility
    const patients = await prisma.patient.findMany()
    for (const patient of patients) {
        await prisma.patient.update({
            where: { id: patient.id },
            data: { facilityId: facility.id }
        })
    }
    console.log(`✅ Linked ${patients.length} patients to facility`)

    // 4. Seed premium services
    const premiumServices = [
        // EXPERIENCIAS
        {
            name: 'Paseo en Jardín Guiado',
            description: 'Caminata acompañada por los jardines con cuidador personal. Incluye hidratación y snacks.',
            category: 'EXPERIENCIAS',
            price: 350,
            icon: 'TreePalm',
            isActive: true,
        },
        {
            name: 'Tarde de Película',
            description: 'Sesión de cine privada con palomitas, bebida y manta. Proyección en sala exclusiva.',
            category: 'EXPERIENCIAS',
            price: 250,
            icon: 'Film',
            isActive: true,
        },
        {
            name: 'Sesión de Música en Vivo',
            description: 'Músico profesional tocará las canciones favoritas de su familiar. Sesión de 45 min.',
            category: 'EXPERIENCIAS',
            price: 800,
            icon: 'Music',
            isActive: true,
        },
        {
            name: 'Clase de Pintura',
            description: 'Taller artístico guiado con materiales incluidos. Ideal para estimulación cognitiva y creatividad.',
            category: 'EXPERIENCIAS',
            price: 300,
            icon: 'Palette',
            isActive: true,
        },
        {
            name: 'Sesión de Bingo Social',
            description: 'Actividad grupal con premios y botanas. Fomenta la socialización y diversión.',
            category: 'EXPERIENCIAS',
            price: 120,
            icon: 'Dice5',
            isActive: true,
        },
        {
            name: 'Paseo en Auto por la Ciudad',
            description: 'Recorrido panorámico de 2 horas con chofer privado. Incluye parada para café.',
            category: 'EXPERIENCIAS',
            price: 950,
            icon: 'Car',
            isActive: true,
        },
        // COMIDAS
        {
            name: 'Cena Gourmet',
            description: 'Platillo especial del chef con ingredientes premium. Incluye postre artesanal.',
            category: 'COMIDAS',
            price: 450,
            icon: 'UtensilsCrossed',
            isActive: true,
        },
        {
            name: 'Pastel de Cumpleaños',
            description: 'Pastel personalizado decorado con mensaje. Perfecto para celebraciones especiales.',
            category: 'COMIDAS',
            price: 580,
            icon: 'Cake',
            isActive: true,
        },
        {
            name: 'Desayuno en Habitación',
            description: 'Servicio de desayuno completo entregado en la habitación. Jugo, fruta, huevo y pan.',
            category: 'COMIDAS',
            price: 180,
            icon: 'Coffee',
            isActive: true,
        },
        {
            name: 'Charola de Fruta Premium',
            description: 'Selección de frutas frescas de temporada cortadas y presentadas elegantemente.',
            category: 'COMIDAS',
            price: 220,
            icon: 'Apple',
            isActive: true,
        },
        {
            name: 'Cena Romántica para Dos',
            description: 'Mesa privada con menú de 3 tiempos, velas y música suave. Perfecto para aniversarios.',
            category: 'COMIDAS',
            price: 1100,
            icon: 'Heart',
            isActive: true,
        },
        {
            name: 'Smoothie & Licuado del Día',
            description: 'Bebida nutritiva preparada al momento con frutas frescas y suplementos vitamínicos.',
            category: 'COMIDAS',
            price: 85,
            icon: 'GlassWater',
            isActive: true,
        },
        // TERAPIAS
        {
            name: 'Masaje Relajante',
            description: 'Sesión de masaje terapéutico de 30 minutos por fisioterapeuta certificado.',
            category: 'TERAPIAS',
            price: 650,
            icon: 'HandHeart',
            isActive: true,
        },
        {
            name: 'Terapia Ocupacional VIP',
            description: 'Sesión individual con terapeuta. Actividades cognitivas y motrices personalizadas.',
            category: 'TERAPIAS',
            price: 900,
            icon: 'Brain',
            isActive: true,
        },
        {
            name: 'Aromaterapia',
            description: 'Sesión de relajación con aceites esenciales. Incluye música ambiental y velas.',
            category: 'TERAPIAS',
            price: 400,
            icon: 'Flower2',
            isActive: true,
        },
        {
            name: 'Yoga & Meditación Guiada',
            description: 'Clase suave de yoga adaptado para adultos mayores. 40 minutos con instructor certificado.',
            category: 'TERAPIAS',
            price: 350,
            icon: 'Dumbbell',
            isActive: true,
        },
        {
            name: 'Fisioterapia Extra',
            description: 'Sesión adicional de rehabilitación física de 45 minutos con especialista.',
            category: 'TERAPIAS',
            price: 750,
            icon: 'HeartPulse',
            isActive: true,
        },
        {
            name: 'Musicoterapia',
            description: 'Terapia con instrumentos musicales para estimulación sensorial y emocional.',
            category: 'TERAPIAS',
            price: 500,
            icon: 'AudioLines',
            isActive: true,
        },
        // CUIDADOS
        {
            name: 'Acompañamiento Nocturno',
            description: 'Cuidador dedicado durante toda la noche. Ideal para pacientes que requieren atención especial.',
            category: 'CUIDADOS',
            price: 1200,
            icon: 'Moon',
            isActive: true,
        },
        {
            name: 'Corte de Cabello & Estilismo',
            description: 'Visita de estilista profesional. Corte, lavado y peinado en la comodidad de su habitación.',
            category: 'CUIDADOS',
            price: 350,
            icon: 'Scissors',
            isActive: true,
        },
        {
            name: 'Videollamada Familiar Asistida',
            description: 'Personal ayuda a configurar y asistir durante una videollamada con la familia.',
            category: 'CUIDADOS',
            price: 150,
            icon: 'Video',
            isActive: true,
        },
        {
            name: 'Manicure & Pedicure',
            description: 'Servicio profesional de cuidado de uñas en habitación. Incluye limado, pintura y crema.',
            category: 'CUIDADOS',
            price: 280,
            icon: 'Sparkles',
            isActive: true,
        },
        {
            name: 'Lectura en Voz Alta',
            description: 'Voluntario lee el libro o periódico favorito de su familiar durante 1 hora.',
            category: 'CUIDADOS',
            price: 100,
            icon: 'BookOpen',
            isActive: true,
        },
        {
            name: 'Servicio de Lavandería Premium',
            description: 'Lavado, planchado y doblado de ropa personal con productos hipoalergénicos de alta calidad.',
            category: 'CUIDADOS',
            price: 200,
            icon: 'Shirt',
            isActive: true,
        },
        // MORE EXPERIENCIAS
        {
            name: 'Taller de Jardinería',
            description: 'Actividad al aire libre plantando flores y hierbas. Materiales y maceta incluidos.',
            category: 'EXPERIENCIAS',
            price: 200,
            icon: 'Sprout',
            isActive: true,
        },
        {
            name: 'Karaoke Privado',
            description: 'Sesión de karaoke con pantalla y micrófono en sala privada. Perfecto para festejar.',
            category: 'EXPERIENCIAS',
            price: 400,
            icon: 'Mic',
            isActive: true,
        },
        {
            name: 'Fotografía Profesional',
            description: 'Sesión de fotos con fotógrafo profesional. 10 fotos editadas entregadas digitalmente.',
            category: 'EXPERIENCIAS',
            price: 700,
            icon: 'Camera',
            isActive: true,
        },
        // MORE COMIDAS
        {
            name: 'Noche de Antojitos Mexicanos',
            description: 'Tacos, quesadillas, sopes y aguas frescas. Menú tradicional servido en mesa.',
            category: 'COMIDAS',
            price: 320,
            icon: 'Beef',
            isActive: true,
        },
        {
            name: 'Té de la Tarde',
            description: 'Servicio estilo inglés con té, galletas, sándwiches y scones. Vajilla especial.',
            category: 'COMIDAS',
            price: 280,
            icon: 'CupSoda',
            isActive: true,
        },
        {
            name: 'Helado Artesanal',
            description: 'Dos bolas de helado artesanal con toppings a elegir. Sabores rotativos semanales.',
            category: 'COMIDAS',
            price: 95,
            icon: 'IceCreamCone',
            isActive: true,
        },
        // MORE TERAPIAS
        {
            name: 'Terapia Asistida con Mascotas',
            description: 'Visita de perro de terapia certificado. Sesión de 30 min que reduce estrés y ansiedad.',
            category: 'TERAPIAS',
            price: 450,
            icon: 'PawPrint',
            isActive: true,
        },
        {
            name: 'Hidroterapia',
            description: 'Sesión guiada en tina terapéutica con jets de agua. Alivia dolores y mejora la circulación.',
            category: 'TERAPIAS',
            price: 850,
            icon: 'Waves',
            isActive: true,
        },
        {
            name: 'Reflexología Podal',
            description: 'Masaje especializado en pies con técnicas de reflexología. Sesión de 25 minutos.',
            category: 'TERAPIAS',
            price: 380,
            icon: 'Footprints',
            isActive: true,
        },
        // MORE CUIDADOS
        {
            name: 'Asistencia con Tecnología',
            description: 'Ayuda para usar tablet, celular o computadora. Configuración de apps y videollamadas.',
            category: 'CUIDADOS',
            price: 180,
            icon: 'Tablet',
            isActive: true,
        },
        {
            name: 'Decoración de Habitación',
            description: 'Decoración temática para cumpleaños, Navidad u ocasión especial. Globos, flores y banners.',
            category: 'CUIDADOS',
            price: 500,
            icon: 'PartyPopper',
            isActive: true,
        },
        {
            name: 'Acompañamiento a Cita Médica',
            description: 'Cuidador acompaña a cita médica externa. Incluye transporte ida y vuelta.',
            category: 'CUIDADOS',
            price: 900,
            icon: 'Ambulance',
            isActive: true,
        },
        // EXPERIENCIAS — Batch 3
        {
            name: 'Visita al Museo',
            description: 'Excursión cultural con transporte adaptado y guía. Incluye entrada y lunch.',
            category: 'EXPERIENCIAS',
            price: 1400,
            icon: 'Landmark',
            isActive: true,
        },
        {
            name: 'Taller de Manualidades',
            description: 'Creación de artesanías con materiales variados. Cada residente se lleva su obra.',
            category: 'EXPERIENCIAS',
            price: 180,
            icon: 'Scissors',
            isActive: true,
        },
        {
            name: 'Cuenta Cuentos',
            description: 'Actor profesional narra historias y leyendas mexicanas. Sesión interactiva de 1 hora.',
            category: 'EXPERIENCIAS',
            price: 350,
            icon: 'BookMarked',
            isActive: true,
        },
        {
            name: 'Noche de Juegos de Mesa',
            description: 'Dominó, lotería, ajedrez y cartas con snacks y bebidas. Actividad social grupal.',
            category: 'EXPERIENCIAS',
            price: 100,
            icon: 'Gamepad2',
            isActive: true,
        },
        // COMIDAS — Batch 3
        {
            name: 'Parrillada Especial',
            description: 'Carne asada, chorizo, nopales y guacamole. Comida al aire libre para 1 persona.',
            category: 'COMIDAS',
            price: 550,
            icon: 'Flame',
            isActive: true,
        },
        {
            name: 'Canasta de Pan Artesanal',
            description: 'Selección de pan dulce recién horneado con chocolate caliente. 6 piezas variadas.',
            category: 'COMIDAS',
            price: 130,
            icon: 'Croissant',
            isActive: true,
        },
        {
            name: 'Sopa del Día Premium',
            description: 'Sopa casera preparada con ingredientes frescos del mercado. Diferente cada día.',
            category: 'COMIDAS',
            price: 110,
            icon: 'Soup',
            isActive: true,
        },
        {
            name: 'Box de Chocolates Finos',
            description: 'Caja de 12 chocolates artesanales mexicanos. Variedad de sabores con cacao oaxaqueño.',
            category: 'COMIDAS',
            price: 380,
            icon: 'Gift',
            isActive: true,
        },
        // TERAPIAS — Batch 3
        {
            name: 'Sesión de Risoterapia',
            description: 'Taller de risa terapéutica que reduce el estrés y fortalece el sistema inmune.',
            category: 'TERAPIAS',
            price: 250,
            icon: 'Smile',
            isActive: true,
        },
        {
            name: 'Terapia de Luz',
            description: 'Sesión de fototerapia para mejorar el ánimo y regular el ciclo de sueño. 20 min.',
            category: 'TERAPIAS',
            price: 300,
            icon: 'Sun',
            isActive: true,
        },
        {
            name: 'Acupresión Terapéutica',
            description: 'Técnicas orientales de presión en puntos clave para aliviar dolor y tensión.',
            category: 'TERAPIAS',
            price: 550,
            icon: 'Target',
            isActive: true,
        },
        {
            name: 'Estimulación Cognitiva',
            description: 'Ejercicios de memoria, atención y lenguaje con neuropsicólogo. Sesión personalizada.',
            category: 'TERAPIAS',
            price: 700,
            icon: 'BrainCircuit',
            isActive: true,
        },
        // CUIDADOS — Batch 3
        {
            name: 'Ramo de Flores Frescas',
            description: 'Arreglo floral semanal para la habitación. Flores frescas de temporada con florero.',
            category: 'CUIDADOS',
            price: 250,
            icon: 'Flower',
            isActive: true,
        },
        {
            name: 'Limpieza Profunda de Habitación',
            description: 'Limpieza a fondo con desinfección, cambio de cortinas y organización de closet.',
            category: 'CUIDADOS',
            price: 400,
            icon: 'SprayCan',
            isActive: true,
        },
        {
            name: 'Sesión de Cuidado Espiritual',
            description: 'Visita de capellán o líder espiritual. Oración, meditación o conversación reconfortante.',
            category: 'CUIDADOS',
            price: 0,
            icon: 'Church',
            isActive: true,
        },
        {
            name: 'Kit de Confort Nocturno',
            description: 'Antifaz, tapones para oídos, té relajante, crema de lavanda y música suave.',
            category: 'CUIDADOS',
            price: 180,
            icon: 'BedDouble',
            isActive: true,
        },
    ]

    // Delete old demo services for this facility
    await prisma.premiumService.deleteMany({
        where: { facilityId: facility.id }
    })

    for (const svc of premiumServices) {
        await prisma.premiumService.create({
            data: {
                ...svc,
                facilityId: facility.id,
            }
        })
    }
    console.log(`✅ Seeded ${premiumServices.length} premium services`)

    console.log('\n🎉 Done! All data seeded successfully.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
