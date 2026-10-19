import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PaywallModal } from '../components/PaywallModal';
import { ChatBubble } from '../components/ChatBubble';
import * as SignalR from '@microsoft/signalr';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://periodically-emails-whereas-evans.trycloudflare.com';

interface MessageItem {
  id: string;
  text: string;
  side: 'user' | 'agent' | 'ai';
}

export default function LiveChatScreen() {
  const isPremium = useSelector((state: RootState) => state.portfolio.user.isPremiumUser);
  const userToken = useSelector((state: RootState) => state.portfolio.user.token);

  const [messages, setMessages] = useState<MessageItem[]>([
    { id: '1', text: 'Welcome to CapitalLoop Support. An expert helper is ready to assist you.', side: 'agent' }
  ]);
  const [input, setInput] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  // ==========================================
  // 🔌 SIGNALR CONNECTION LIFECYCLE MANAGEMENT
  // ==========================================
  useEffect(() => {
    if (!isPremium || !userToken) return;

    setIsConnecting(true);

    const hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/support-hub?access_token=${userToken}`, {
        skipNegotiation: true,
        transport: SignalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    hubConnection.on("ReceiveAgentMessage", (agentEmail: string, messagePayload: string) => {
      console.log(`✉️ Direct message received from agent: ${agentEmail}`);
      setMessages(prev => [
        ...prev, 
        { id: Math.random().toString(), text: messagePayload, side: 'agent' }
      ]);
    });

    hubConnection.start()
      .then(() => {
        console.log("🚀 SignalR WebSocket Pipeline established successfully.");
        setIsConnecting(false);
      })
      .catch(err => {
        console.error("❌ SignalR link failure:", err);
        setIsConnecting(false);
        Alert.alert("Connection Error", "Failed to connect to the live support gateway.");
      });

    connectionRef.current = hubConnection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log("🔌 SignalR connection gracefully disconnected.");
      }
    };
  }, [isPremium, userToken]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ==========================================
  // ✉️ TRANSMISSION HANDLER
  // ==========================================
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!isPremium) {
      setPaywall(true); 
      return;
    }

    const currentInput = input;
    setInput('');

    setMessages(prev => [...prev, { id: Math.random().toString(), text: currentInput, side: 'user' }]);

    try {
      if (connectionRef.current && connectionRef.current.state === SignalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("SendMessageToAgent", currentInput);
      } else {
        throw new Error("WebSocket pipeline link is currently unready or broken.");
      }
    } catch (err: any) {
      console.error("Failed to stream message over hub execution link:", err);
      Alert.alert("Delivery Failure", "Message failed to reach the server.");
      setMessages(prev => [...prev, { id: Math.random().toString(), text: "⚠️ Message failed to send.", side: 'agent' }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
      keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0} 
    >
      {!isPremium && (
        <TouchableOpacity style={styles.upgradeBanner} onPress={() => setPaywall(true)} activeOpacity={0.9}>
          <Text style={styles.upgradeText}>✨ Live Chat is locked. Tap here to unlock Premium Support.</Text>
        </TouchableOpacity>
      )}

      {isConnecting && isPremium && (
        <View style={styles.connectingBanner}>
          <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.connectingText}>Connecting to support chat...</Text>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scroller} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <ChatBubble key={msg.id} text={msg.text} side={msg.side} />
        ))}
      </ScrollView>

      {/* Quick Prompt Chips */}
      {isPremium && (
        <View style={styles.quickPromptsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsContainer}>
            <TouchableOpacity 
              style={styles.promptChip} 
              onPress={() => setInput("What is the CGT rate on selling PSX shares before 1 year?")}
            >
              <Text style={styles.promptChipText}>📊 PSX CGT Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.promptChip} 
              onPress={() => setInput("How does PKR devaluation protect my Gold Tola holdings?")}
            >
              <Text style={styles.promptChipText}>🪙 Gold vs Devaluation</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.promptChip} 
              onPress={() => setInput("What is the SECP limit on Binance crypto holdings?")}
            >
              <Text style={styles.promptChipText}>⚡ SECP Crypto Cap</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <TouchableOpacity 
        activeOpacity={1} 
        onPress={!isPremium ? () => setPaywall(true) : undefined}
        style={styles.inputWrapper}
      >
        <View style={styles.inputArea} pointerEvents={!isPremium ? 'none' : 'auto'}>
          <TextInput 
            style={styles.input} 
            value={input} 
            onChangeText={setInput} 
            placeholder={isPremium ? "Type your message..." : "Tap to upgrade and unlock support..."} 
            placeholderTextColor="#94A3B8"
            editable={isPremium && !isConnecting} 
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!input.trim() || isConnecting) && styles.disabledBtn]} 
            onPress={sendMessage}
            disabled={!input.trim() || isConnecting}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' /* Clean premium light grey slate canvas background */
  },
  upgradeBanner: {
    backgroundColor: '#FFFBEB', /* Soft welcoming gold premium upgrade stripe banner */
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#FDE68A'
  },
  upgradeText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.1
  },
  connectingBanner: { 
    flexDirection: 'row', 
    backgroundColor: '#EFF6FF', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#BFDBFE'
  },
  connectingText: { 
    color: '#2563EB', 
    fontSize: 13, 
    fontWeight: '600',
    letterSpacing: -0.1
  },
  scroller: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30
  },
  inputWrapper: { 
    width: '100%' 
  },
  inputArea: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper-white lower utility deck block */
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16 /* Smooth negative padding anchor space for iOS gestures */
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    color: '#0F172A', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 14, 
    fontSize: 15, 
    borderWidth: 1, 
    borderColor: '#CBD5E1' 
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#0F172A', /* Saturated dark ink slate button base */
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12 
  },
  disabledBtn: { 
    backgroundColor: '#E2E8F0', 
    opacity: 0.8 
  },
  sendIcon: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800' 
  },
  quickPromptsWrap: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});