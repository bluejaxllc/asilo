
import { reactor } from './reactor';
import { TestAgent } from '../examples/test-agent';
import { LowStockAgent } from '../examples/low-stock-agent';
import { DailySummaryAgent } from '../examples/daily-summary-agent';
import { AttendanceAuditAgent } from '../examples/attendance-audit-agent';
import { MessageAlertAgent } from '../examples/message-alert-agent';

// Initialize registry
const registry = reactor;

// Register known agents
registry.register(new TestAgent());
registry.register(new LowStockAgent());
registry.register(new DailySummaryAgent());
registry.register(new AttendanceAuditAgent());
registry.register(new MessageAlertAgent());

export function getRegistry() {
    return registry;
}
