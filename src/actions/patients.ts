"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { PatientSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export const createPatient = async (values: z.infer<typeof PatientSchema>) => {
    const validatedFields = PatientSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const {
        firstName,
        lastName,
        dateOfBirth,
        roomNumber,
        medicalHistory,
        dietaryRequirements,
        allergies,
        emergencyContactName,
        emergencyContactPhone
    } = validatedFields.data;

    // Construct full name for simple schema
    const fullName = `${firstName} ${lastName}`;

    // Combine allergies into dietary or medical history if not separate fields in DB yet
    // The current schema has: name, room, status, age, medicalHistory, dietaryNeeds
    // It does NOT have separate fields for allergies or emergency contact yet.
    // We will append them to medical/dietary notes for now or update schema later.
    // Let's stick to the current schema for safety.

    let finalMedicalHistory = medicalHistory || "";
    if (allergies) finalMedicalHistory += `\nALERGIAS: ${allergies}`;
    if (emergencyContactName) finalMedicalHistory += `\nCONTACTO: ${emergencyContactName} (${emergencyContactPhone})`;

    // Calculate age if DOB provided
    let age = 0;
    if (dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    }

    try {
        await db.patient.create({
            data: {
                name: fullName,
                room: roomNumber,
                age: age > 0 ? age : undefined,
                medicalHistory: finalMedicalHistory,
                dietaryNeeds: dietaryRequirements,
                status: "Estable" // Default
            }
        });

        revalidatePath("/admin/patients");
        return { success: "Residente creado exitosamente!" };
    } catch (error) {
        return { error: "Error al crear residente" };
    }
};

export const getPatientById = async (id: string) => {
    try {
        const patient = await db.patient.findUnique({
            where: { id },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: {
                        author: true
                    }
                },
                medications: {
                    include: {
                        medication: true
                    }
                }
            }
        });
        return patient;
    } catch (error) {
        return null;
    }
};

export const getPatients = async (query?: string) => {
    try {
        const whereClause = query ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' as const } },
                { room: { contains: query, mode: 'insensitive' as const } }
            ]
        } : {};

        const patients = await db.patient.findMany({
            where: whereClause,
            orderBy: { name: 'asc' },
            include: {
                logs: {
                    where: { type: 'VITALS' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        return patients;
    } catch (error) {
        console.error("Error fetching patients:", error);
        return [];
    }
};
