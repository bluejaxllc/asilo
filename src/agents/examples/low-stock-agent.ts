
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { sendWhatsAppAlert } from '@/actions/whatsapp';

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

        // Create notifications for each low-stock item
        for (const item of lowStockItems) {
            const isOutOfStock = item.stock === 0;
            await db.notification.create({
                data: {
                    title: isOutOfStock ? `⚠️ AGOTADO: ${item.name}` : `📦 Stock Bajo: ${item.name}`,
                    message: isOutOfStock
                        ? `${item.name} está completamente agotado. Se requiere resurtir urgente.`
                        : `${item.name} tiene ${item.stock} ${item.unit} (mínimo: ${item.minStock}).`,
                    type: isOutOfStock ? 'CRITICAL' : 'WARNING',
                }
            });

            // Trigger WhatsApp alert for critical stock (0)
            if (isOutOfStock) {
                await sendWhatsAppAlert(
                    "+521234567890", // Simulated admin number
                    `📦 STOCK AGOTADO: El artículo "${item.name}" se ha agotado por completo. Se requiere resurtir inmediatamente.`
                );
            }
        }

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
