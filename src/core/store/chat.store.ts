import { create } from 'zustand';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { ChatMessageDto } from '../types/chat.types';
import { ChatService } from '../services/chat.service';

interface ChatState {
  messages: ChatMessageDto[];
  unreadCount: number;
  isHubConnected: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // 🎛️ Action Core Matrix
  initializeSignalRHubAsync: () => Promise<void>;
  disconnectSignalRHubAsync: () => Promise<void>;
  sendSocketMessageAsync: (payloadText: string) => Promise<boolean>;
  resetUnreadCount: () => void;
  clearChatCache: () => void;
}

// Global singleton holder reference to keep the physical WebSocket channel safely outside the re-render loops
let sharedHubConnection: HubConnection | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isHubConnected: false,
  isLoadingHistory: false,
  error: null,

  /**
   * 🔗 ESTABLISH DUPLEX WEBSOCKET HANDSHAKE
   * Plugs straight into /hubs/support and spins up background execution listeners
   */
  initializeSignalRHubAsync: async () => {
    // Prevent duplicate multi-socket pipeline allocation bugs
    if (sharedHubConnection && sharedHubConnection.state !== HubConnectionState.Disconnected) {
      console.log("[SIGNALR STORE] Duplex channel block is already active or connecting.");
      return;
    }

    try {
      set({ isLoadingHistory: true, error: null });
      console.log("[SIGNALR STORE] Querying historical conversational database nodes over LAN...");

      // Fetch message history concurrently via REST fallback endpoint before upgrading to socket
      const historyLog = await ChatService.getMessageHistoryAsync();
      set({ messages: historyLog });

      // Build out the concrete Microsoft SignalR hub transport configuration block
      // Replace IP address mapping targets to match your active Kestrel machine subnet configuration port parameters
      const localGatewayHubUrl = "http://192.168.0.104:5156/hubs/support";

      sharedHubConnection = new HubConnectionBuilder()
        .withUrl(localGatewayHubUrl)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Graceful retry matrix rules
        .configureLogging(LogLevel.Information)
        .build();

      // =======================================================================
      // 📡 INBOUND STREAM LISTENER HOOK: RECEIVEMESSAGE RPC
      // =======================================================================
      sharedHubConnection.on("ReceiveMessage", (incomingMessage: ChatMessageDto) => {
        console.log("[SIGNALR RECEIVE] Live message payload caught:", incomingMessage);
        
        // Append message frame securely to the localized layout state collection array
        set((state) => ({
          messages: [...state.messages, incomingMessage],
          // Only increment unread metric counters if user is outside the active support tab views
          unreadCount: incomingMessage.isClientMessage ? state.unreadCount : state.unreadCount + 1
        }));
      });

      // Track connectivity events via connection life tokens
      sharedHubConnection.onreconnecting((error) => {
        console.warn("[SIGNALR STATUS] Socket link disrupted. Reconnecting...", error);
        set({ isHubConnected: false });
      });

      sharedHubConnection.onreconnected((connectionId) => {
        console.log("[SIGNALR STATUS] Connection re-established safely. Token ID:", connectionId);
        set({ isHubConnected: true });
      });

      sharedHubConnection.onclose((error) => {
        console.error("[SIGNALR STATUS] Socket channel terminated:", error);
        set({ isHubConnected: false });
      });

      console.log("[SIGNALR STORE] Initializing live transport level connection handshake protocol...");
      await sharedHubConnection.start();
      
      set({ isHubConnected: true });
      console.log("[SIGNALR STORE] Duplex communications active. Channel state: 200 OK.");

    } catch (err: any) {
      console.error("[SIGNALR CRASH] Handshake initial configuration pipeline broken:", err);
      set({ error: err?.message || "Failed to initialize live chat connection links." });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  /**
   * 🛑 DISCONNECT DUPLEX WORKER CORE
   * Teardown open sockets smoothly to prevent thread storage leaks
   */
  disconnectSignalRHubAsync: async () => {
    if (!sharedHubConnection || sharedHubConnection.state === HubConnectionState.Disconnected) return;

    try {
      console.log("[SIGNALR STORE] Demolishing active WebSocket socket allocation channels...");
      await sharedHubConnection.stop();
      sharedHubConnection = null;
      set({ isHubConnected: false });
      console.log("[SIGNALR STORE] Teardown process executed cleanly.");
    } catch (err) {
      console.error("[SIGNALR CRASH] Error during connection cleanup thread execution:", err);
    }
  },

  /**
   * 📤 OUTBOUND TRANSPORT DISPATCH CHANNEL
   * Streams chat payloads straight across the socket matrix via explicit Server RPC methods
   */
  sendSocketMessageAsync: async (payloadText: string) => {
    if (!sharedHubConnection || sharedHubConnection.state !== HubConnectionState.Connected) {
      console.error("[SIGNALR STORE] Transmission rejected. WebSocket channel is currently offline.");
      return false;
    }

    try {
      console.log("[SIGNALR SEND] Streaming payload text up the server stack via RPC method...");
      
      // Injects payload via RPC into backend Hub listener logic
      // Server will process string, write to dbo.ChatMessages, and bounce back to group via 'ReceiveMessage'
      await sharedHubConnection.invoke("SendMessage", payloadText);
      
      return true;
    } catch (err) {
      console.error("[SIGNALR CRASH] Outbound package drop failure:", err);
      return false;
    }
  },

  /**
   * 🧼 CLEAR NOTIFICATION INDICATOR COUNTERS
   */
  resetUnreadCount: () => {
    set({ unreadCount: 0 });
    console.log("[STORE ACTION] Unread conversational markers reset to zero layout balance.");
  },

  /**
   * 🧼 SYSTEM SECURITY PURGE
   */
  clearChatCache: () => {
    get().disconnectSignalRHubAsync();
    set({
      messages: [],
      unreadCount: 0,
      isHubConnected: false,
      isLoadingHistory: false,
      error: null
    });
    console.log("[STORE PURGE] Conversational logging parameters wiped from client runtime structures.");
  }
}));