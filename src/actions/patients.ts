"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { PatientSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/role-guard";

export const createPatient = async (values: z.infer<typeof PatientSchema>) => {
    const check = await requireRole("ADMIN");
    if ("error" in check) return { error: check.error };

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
                },
                notifications: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
        return patient;
    } catch (error) {
        return null;
    }
};

export const updatePatient = async (
    id: string,
    data: {
        name?: string;
        room?: string;
        status?: string;
        age?: number;
        medicalHistory?: string;
        dietaryNeeds?: string;
    }
) => {
    const check = await requireRole("ADMIN", "DOCTOR", "NURSE");
    if ("error" in check) return { error: check.error };

    try {
        await db.patient.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.room !== undefined && { room: data.room }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.age !== undefined && { age: data.age }),
                ...(data.medicalHistory !== undefined && { medicalHistory: data.medicalHistory }),
                ...(data.dietaryNeeds !== undefined && { dietaryNeeds: data.dietaryNeeds }),
            }
        });

        revalidatePath(`/admin/patients/${id}`);
        revalidatePath("/admin/patients");
        revalidatePath("/staff/patients");
        return { success: "Residente actualizado exitosamente" };
    } catch (error) {
        console.error("Error updating patient:", error);
        return { error: "Error al actualizar residente" };
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
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                medications: {
                    include: {
                        medication: true
                    }
                }
            }
        });
        return patients;
    } catch (error) {
        console.error("Error fetching patients:", error);
        return [];
    }
};
