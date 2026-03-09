import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(1, {
        message: "Password is required",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required",
    }),
    name: z.string().min(1, {
        message: "Name is required",
    }),
    role: z.string().optional(),
    plan: z.enum(["FREE", "CORE", "ENTERPRISE"]).optional(),
    facilityName: z.string().optional(),
});

export const PatientSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    dateOfBirth: z.string().optional(),
    roomNumber: z.string().optional(),
    medicalHistory: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    allergies: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
});

export const OnboardingSchema = z.object({
    facilityName: z.string().min(1, { message: "El nombre de la residencia es requerido" }),
    staffEmails: z.array(z.string().email({ message: "Correo inválido" })).optional(),
});

export const ResetPasswordSchema = z.object({
    password: z.string().min(6, { message: "Mínimo 6 caracteres requeridos" }),
    confirmPassword: z.string().min(6, { message: "Mínimo 6 caracteres requeridos" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
});
