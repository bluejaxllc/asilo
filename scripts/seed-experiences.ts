import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_EXPERIENCES = [
    { name: "Peluquería y Barbería a Domicilio", description: "Corte de cabello, arreglo de barba y peinado en la comodidad de la habitación.", price: 350, icon: "Scissors" },
    { name: "Fisioterapia Premium 1:1", description: "Sesión privada de 45 min enfocada en rehabilitación motriz y prevención integral.", price: 600, icon: "Activity" },
    { name: "Escolta para Citas Médicas", description: "Acompañamiento VIP con transporte privado ida y vuelta a citas externas.", price: 800, icon: "Car" },
    { name: "Masaje Terapéutico Relajante", description: "Masaje de cuerpo entero para mejorar la circulación y aliviar tensiones (50 min).", price: 750, icon: "HeartHandshake" },
    { name: "Cena Gourmet de Cumpleaños", description: "Banquete privado para el residente y hasta 3 invitados con menú a 3 tiempos.", price: 1500, icon: "Cake" },
    { name: "Musicoterapia Personalizada", description: "Sesión 1 a 1 de estimulación cognitiva mediante música de su época favorita.", price: 450, icon: "Music" },
    { name: "Podología Clínica y Spa", description: "Atención especializada de pie diabético, corte preventivo y masaje de pies.", price: 500, icon: "Footprints" },
    { name: "Arteterapia Individual", description: "Materiales y guía personalizada en pintura o manualidades para estimulación.", price: 400, icon: "Palette" },
    { name: "Spa de Manicura y Pedicura", description: "Cuidado completo de uñas, esmaltado y crema hidratante especial.", price: 450, icon: "Sparkles" },
    { name: "Conexión Familiar Virtual VIP", description: "Asistencia técnica dedicada (iPad/TV) durante 1 hora para videollamada familiar.", price: 200, icon: "Video" },
    { name: "Paseo Guiado de Fin de Semana", description: "Ruta segura en silla de ruedas o caminando por parques aledaños (1h).", price: 300, icon: "Sun" },
    { name: "Cuidador Nocturno Exclusivo", description: "Vigilancia y asistencia personal 1 a 1 dedicada durante toda la noche (10pm-6am).", price: 1200, icon: "Moon" }
];

async function main() {
    // get first facility
    const facility = await prisma.facility.findFirst();
    if (!facility) {
        console.error("No facility found.");
        return;
    }

    const count = await prisma.premiumService.count({ where: { facilityId: facility.id } });
    if (count > 0) {
        console.log(`Already has ${count} experiences.`);
        return;
    }

    let added = 0;
    for (const exp of DEFAULT_EXPERIENCES) {
        await prisma.premiumService.create({
            data: {
                ...exp,
                facilityId: facility.id,
                isActive: true
            }
        });
        added++;
    }

    console.log(`Seeded ${added} premium experiences successfully!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
