
import { reactor } from './reactor';
import { TestAgent } from '../examples/test-agent';
import { LowStockAgent } from '../examples/low-stock-agent';

// Initialize registry
const registry = reactor;

// Register known agents
registry.register(new TestAgent());
registry.register(new LowStockAgent());

export function getRegistry() {
    return registry;
}
