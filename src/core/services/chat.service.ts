import { apiClient } from './api.client';
import { ChatMessageDto, ChatSessionSummaryDto } from '../types/chat.types';

export class ChatService {
  /**
   * 📜 FETCH HISTORICAL CHAT CHANNELS MESSAGES
   * Path: GET /api/chat/history
   * Maps directly to backend MediatR: GetChatHistoryQuery
   * Restores structural logging arrays prior to upgrading protocol to WebSockets
   */
  public static async getMessageHistoryAsync(): Promise<ChatMessageDto[]> {
    const response = await apiClient.get<ChatMessageDto[]>('/api/chat/history');
    return response.data;
  }

  /**
   * 📨 REST FALLBACK OUTBOUND METHOD
   * Path: POST /api/chat/send
   * Maps directly to backend MediatR: SendChatMessageCommand
   * Serves as an architectural fallback strategy if local socket proxies are firewalled
   */
  public static async sendHttpMessageAsync(payloadText: string): Promise<ChatMessageDto> {
    const response = await apiClient.post<ChatMessageDto>('/api/chat/send', { payloadText });
    return response.data;
  }

  /**
   * 📊 FETCH CONVERSATIONAL MUTATION META SUMMARY
   * Path: GET /api/chat/summary
   * Maps directly to backend MediatR: GetChatSessionSummaryQuery
   * Tracks real-time unread messages counters and active support agent assignments
   */
  public static async getChatSessionSummaryAsync(): Promise<ChatSessionSummaryDto> {
    const response = await apiClient.get<ChatSessionSummaryDto>('/api/chat/summary');
    return response.data;
  }
}