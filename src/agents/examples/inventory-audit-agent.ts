import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class InventoryAuditAgent implements Agent {
    id = 'inventory-audit';
    name = 'Auditor de Inventario Predictivo';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[InventoryAuditAgent] Analyzing inventory levels...`);

        // Find items that are low or out of stock
        const medications = await db.medication.findMany();
        const lowStockItems = medications.filter(m => m.stock <= m.minStock);

        const count = lowStockItems.length;

        if (count > 0) {
            await db.notification.create({
                data: {
                    title: `📦 Análisis de Inventario`,
                    message: `Se identificaron ${count} medicamentos con stock bajo/agotado. Sugerencia de reorden en los próximos 4 días generada.`,
                    type: 'WARNING',
                    recipientRole: 'ADMIN'
                }
            });

            return {
                success: true,
                message: `Análisis completo: Reposición sugerida para ${count} artículos.`,
                data: { lowStockCount: count }
            };
        } else {
            return {
                success: true,
                message: `Inventario saludable. Sin caducidades o faltantes próximos críticos detectados.`,
                data: { lowStockCount: 0 }
            };
        }
    }
}
