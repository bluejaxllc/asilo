
import { reactor } from './reactor';
import { TestAgent } from '../examples/test-agent';
import { LowStockAgent } from '../examples/low-stock-agent';
import { DailySummaryAgent } from '../examples/daily-summary-agent';
import { AttendanceAuditAgent } from '../examples/attendance-audit-agent';
import { MessageAlertAgent } from '../examples/message-alert-agent';
import { PatientRiskAuditAgent } from '../examples/patient-risk-audit-agent';
import { EfficiencyAuditAgent } from '../examples/efficiency-audit-agent';
import { ReputationAgent } from '../examples/reputation-agent';
import { MarketingAgent } from '../examples/marketing-agent';
import { TrendAnalysisAgent } from '../examples/trend-analysis-agent';

import { ClinicalNotesAgent } from '../examples/clinical-notes-agent';
import { ScheduleOptimizerAgent } from '../examples/schedule-optimizer-agent';
import { LeadScoringAgent } from '../examples/lead-scoring-agent';
import { InventoryAuditAgent } from '../examples/inventory-audit-agent';
import { CampaignGeneratorAgent } from '../examples/campaign-generator-agent';
import { LogAnalysisAgent } from '../examples/log-analysis-agent';
import { VoiceToTaskAgent } from '../examples/voice-to-task-agent';
import { MessageAuditAgent } from '../examples/message-audit-agent';
import { PdfExportAgent } from '../examples/pdf-export-agent';
import { TourBookingAgent } from '../examples/tour-booking-agent';
import { SmartReplyAgent } from '../examples/smart-reply-agent';
import { WhatsAppIntegrationAgent } from '../examples/whatsapp-integration-agent';

// Initialize registry
const registry = reactor;

// Register known agents
registry.register(new TestAgent());
registry.register(new LowStockAgent());
registry.register(new DailySummaryAgent());
registry.register(new AttendanceAuditAgent());
registry.register(new MessageAlertAgent());
registry.register(new PatientRiskAuditAgent());
registry.register(new EfficiencyAuditAgent());
registry.register(new ReputationAgent());
registry.register(new MarketingAgent());
registry.register(new TrendAnalysisAgent());

registry.register(new ClinicalNotesAgent());
registry.register(new ScheduleOptimizerAgent());
registry.register(new LeadScoringAgent());
registry.register(new InventoryAuditAgent());
registry.register(new CampaignGeneratorAgent());
registry.register(new LogAnalysisAgent());
registry.register(new VoiceToTaskAgent());
registry.register(new MessageAuditAgent());
registry.register(new PdfExportAgent());
registry.register(new TourBookingAgent());
registry.register(new SmartReplyAgent());
registry.register(new WhatsAppIntegrationAgent());

export function getRegistry() {
    return registry;
}
