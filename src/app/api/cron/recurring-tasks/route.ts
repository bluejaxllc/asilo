import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Daily cron job that spawns new task instances for recurring tasks.
 * 
 * Logic:
 * - DAILY: if a recurring task was completed, spawn a new PENDING copy for today
 * - WEEKLY: spawn if 7+ days since last instance
 * - MONTHLY: spawn if different month from last instance
 * - YEARLY: spawn if different year from last instance
 * - BIRTHDAY: spawn if today is the linked patient's birthday
 * 
 * Schedule: every day at 06:00 UTC (midnight CST)
 * Security: protected by CRON_SECRET bearer token
 */
export async function GET(request: Request) {
    // ── Auth check ──────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let created = 0;

        // Get all recurring task templates (original tasks with recurrence != NONE)
        // Only process templates, not spawned instances (parentTaskId == null)
        const recurringTasks = await db.task.findMany({
            where: {
                recurrence: { not: "NONE" },
                parentTaskId: null, // Only templates, not spawned children
            },
            include: {
                patient: {
                    select: { id: true, name: true, dateOfBirth: true }
                }
            }
        });

        for (const task of recurringTasks) {
            // Skip if recurrence has ended
            if (task.recurrenceEnd && new Date(task.recurrenceEnd) < today) {
                continue;
            }

            // Check if we already created an instance today
            const existingToday = await db.task.findFirst({
                where: {
                    parentTaskId: task.id,
                    createdAt: { gte: today },
                }
            });

            if (existingToday) continue;

            let shouldSpawn = false;

            switch (task.recurrence) {
                case "DAILY":
                    // Always spawn daily (if not already spawned today)
                    shouldSpawn = true;
                    break;

                case "WEEKLY": {
                    // Spawn if it's been 7+ days since last instance
                    const lastWeekly = await db.task.findFirst({
                        where: { parentTaskId: task.id },
                        orderBy: { createdAt: 'desc' },
                    });
                    if (!lastWeekly) {
                        shouldSpawn = true;
                    } else {
                        const daysSince = Math.floor(
                            (today.getTime() - new Date(lastWeekly.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        shouldSpawn = daysSince >= 7;
                    }
                    break;
                }

                case "MONTHLY": {
                    // Spawn if no instance this month
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const existingThisMonth = await db.task.findFirst({
                        where: {
                            parentTaskId: task.id,
                            createdAt: { gte: startOfMonth },
                        }
                    });
                    shouldSpawn = !existingThisMonth;
                    break;
                }

                case "YEARLY": {
                    // Spawn if no instance this year
                    const startOfYear = new Date(today.getFullYear(), 0, 1);
                    const existingThisYear = await db.task.findFirst({
                        where: {
                            parentTaskId: task.id,
                            createdAt: { gte: startOfYear },
                        }
                    });
                    shouldSpawn = !existingThisYear;
                    break;
                }

                case "BIRTHDAY": {
                    // Spawn if today is the patient's birthday
                    if (task.patient?.dateOfBirth) {
                        const birthday = new Date(task.patient.dateOfBirth);
                        shouldSpawn = (
                            today.getMonth() === birthday.getMonth() &&
                            today.getDate() === birthday.getDate()
                        );
                    }
                    break;
                }
            }

            if (shouldSpawn) {
                // Create a new PENDING task instance
                const recurrenceLabels: Record<string, string> = {
                    DAILY: "diaria",
                    WEEKLY: "semanal",
                    MONTHLY: "mensual",
                    YEARLY: "anual",
                    BIRTHDAY: "cumpleaños",
                };

                await db.task.create({
                    data: {
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        status: "PENDING",
                        dueDate: task.dueDate
                            ? new Date(today.getTime() + (new Date(task.dueDate).getTime() - new Date(task.createdAt).getTime()))
                            : null,
                        recurrence: "NONE", // Spawned instances are not themselves recurring
                        parentTaskId: task.id,
                        assignedToId: task.assignedToId,
                        patientId: task.patientId,
                        facilityId: task.facilityId,
                    }
                });
                created++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${recurringTasks.length} templates, created ${created} new task instances`,
            timestamp: today.toISOString(),
        });
    } catch (error) {
        console.error("Recurring tasks cron error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
