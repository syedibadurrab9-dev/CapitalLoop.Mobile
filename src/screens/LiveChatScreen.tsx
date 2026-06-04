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

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface MessageItem {
  id: string;
  text: string;
  side: 'user' | 'agent' | 'ai';
}

export default function LiveChatScreen() {
  const isPremium = useSelector((state: RootState) => state.portfolio.user.isPremiumUser);
  const userToken = useSelector((state: RootState) => state.portfolio.user.token);

  const [messages, setMessages] = useState<MessageItem[]>([
    { id: '1', text: 'CapitalLoop Priority Stream Engine online. Enterprise support desk stands ready.', side: 'agent' }
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

    // 🚀 FIXED PARAMETERS: Matches the backend (.SendAsync("ReceiveAgentMessage", agentEmail, messagePayload))
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
        Alert.alert("Connection Error", "Failed to connect to real-time support gateway.");
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
        // Invokes the hub targeting your support specialists group
        await connectionRef.current.invoke("SendMessageToAgent", currentInput);
      } else {
        throw new Error("WebSocket pipeline link is currently unready or broken.");
      }
    } catch (err: any) {
      console.error("Failed to stream message over hub execution link:", err);
      Alert.alert("Delivery Failure", "Message failed to reach server.");
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
        <TouchableOpacity style={styles.upgradeBanner} onPress={() => setPaywall(true)}>
          <Text style={styles.upgradeText}>✨ Live Chat is locked. Tap here to unlock Premium Support.</Text>
        </TouchableOpacity>
      )}

      {isConnecting && isPremium && (
        <View style={styles.connectingBanner}>
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.connectingText}>Syncing with support matrix gateway...</Text>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scroller} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" 
      >
        {messages.map(msg => (
          <ChatBubble key={msg.id} text={msg.text} side={msg.side} />
        ))}
      </ScrollView>

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
            placeholder={isPremium ? "Send secure message over WSS link..." : "Tap to upgrade and unlock support..."} 
            placeholderTextColor="#475569"
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  upgradeBanner: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  connectingBanner: { flexDirection: 'row', backgroundColor: '#0284C7', paddingVertical: 6, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  connectingText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scroller: { flex: 1 },
  scrollContent: { padding: 20 },
  inputWrapper: { width: '100%' },
  inputArea: { 
    flexDirection: 'row', 
    backgroundColor: '#1E293B', 
    paddingHorizontal: 12, 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderColor: '#334155',
  },
  input: { flex: 1, backgroundColor: '#0F172A', color: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 14, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  disabledBtn: { backgroundColor: '#64748B', opacity: 0.6 },
  sendIcon: { color: '#0F172A', fontSize: 16, fontWeight: '800' }
});