
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { sendWhatsAppAlert } from '@/actions/whatsapp';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class LowStockAgent implements Agent {
    id = 'low-stock-monitor';
    name = 'Auditor de Inventario';
    scheduleDescription = 'Cada hora';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[LowStockAgent] Starting inventory audit...`);

        // Fetch all medications and filter in JS (Prisma doesn't support column-to-column comparison)
        const allMedications = await db.medication.findMany();
        const lowStockItems = allMedications.filter(med => med.stock <= med.minStock);

        if (lowStockItems.length === 0) {
            return { success: true, message: 'Sin artículos con stock bajo.' };
        }

        console.log(`[LowStockAgent] Found ${lowStockItems.length} items with low stock.`);

        // Trigger individual WhatsApp alerts for critically out-of-stock items
        for (const item of lowStockItems) {
            if (item.stock === 0) {
                await sendWhatsAppAlert(
                    "+521234567890", // Simulated admin number
                    `📦 STOCK AGOTADO: El artículo "${item.name}" se ha agotado por completo. Se requiere resurtir inmediatamente.`
                );
            }
        }

        const prompt = `Actúa como BlueJax, el Gestor de Inventario del Asilo.
Tienes que reportar los siguientes artículos con stock bajo o agotado:
${lowStockItems.map(i => `- ${i.name}: ${i.stock} ${i.unit} (Mínimo: ${i.minStock})`).join('\n')}
Genera un mensaje de alerta de inventario (máximo 3 oraciones) para el administrador, destacando los artículos urgentes y recomendando la compra.`;

        let message = `${lowStockItems.length} artículos detectados con stock bajo.`;
        try {
            message = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating low stock alert", err);
        }

        // Create a single aggregated summary notification
        await db.notification.create({
            data: {
                title: `📦 Alerta de Inventario IA`,
                message: message,
                type: lowStockItems.some(i => i.stock === 0) ? 'CRITICAL' : 'WARNING',
            }
        });

        const itemNames = lowStockItems.map(i => `${i.name} (${i.stock}/${i.minStock})`).join(', ');

        return {
            success: true,
            message: `${lowStockItems.length} artículos con stock bajo detectados.`,
            data: {
                items: lowStockItems.map(i => ({ name: i.name, stock: i.stock, min: i.minStock, unit: i.unit })),
                summary: itemNames,
                notificationsCreated: lowStockItems.length
            }
        };
    }
}
