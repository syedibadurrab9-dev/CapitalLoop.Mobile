// =============================================================================
// 📊 MODULE 5: REAL-TIME LIVE CHAT SIGNALR CONTRACTS
// =============================================================================

export interface ChatMessageDto {
  id: string;                     // Primary key Guid string tracking in dbo.ChatMessages
  senderId: string;
  senderName: string;
  payloadText: string;
  isClientMessage: boolean;       // True if dispatched by mobile user, False if from Angular Admin desk
  timestampUtc: string;
}

export interface SendMessageCommand {
  payloadText: string;            // Simple raw text payload dispatched up the socket pipe
}

export interface ChatSessionSummaryDto {
  ticketId: string;
  unreadCount: number;
  isAgentAssigned: boolean;
  assignedAgentName: string | null;
  lastActivityUtc: string;
}