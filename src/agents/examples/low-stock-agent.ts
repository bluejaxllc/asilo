
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db'; // Import the shared Prisma client

export class LowStockAgent implements Agent {
    id = 'low-stock-monitor';
    name = 'Inventory Auditor';
    scheduleDescription = 'Hourly';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[LowStockAgent] Starting inventory audit...`);

        // 1. Find items with stock <= minStock
        const lowStockItems = await db.medication.findMany({
            where: {
                stock: {
                    lte: db.medication.fields.minStock
                }
            }
        });

        if (lowStockItems.length === 0) {
            return { success: true, message: 'No low stock items found.' };
        }

        // 2. Log alerts (simulation: just creating a system note/log)
        // In a real system, we might send emails or create formal Alerts
        console.log(`[LowStockAgent] Found ${lowStockItems.length} items with low stock.`);

        // Example: Create a log entry for the admin (using a system user ID if available, or just logging)
        // For now, we just return them in the data
        const itemNames = lowStockItems.map(i => `${i.name} (${i.stock}/${i.minStock})`).join(', ');

        return {
            success: true,
            message: `Found ${lowStockItems.length} low stock items.`,
            data: {
                items: lowStockItems.map(i => ({ name: i.name, stock: i.stock, min: i.minStock })),
                summary: itemNames
            }
        };
    }
}
