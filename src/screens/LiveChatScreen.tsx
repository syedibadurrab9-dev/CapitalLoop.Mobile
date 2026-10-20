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
import { getApiBaseUrl } from '../services/gatewayService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InstitutionalHeader } from '../components/InstitutionalHeader';
import { BottomNavBar, TabRouteName } from '../components/BottomNavBar';
import { LeftDrawer } from '../components/LeftDrawer';

const getBackendUrl = () => getApiBaseUrl();

interface MessageItem {
  id: string;
  text: string;
  side: 'user' | 'agent' | 'ai';
}

interface AssignedAdvisorInfo {
  email: string;
  name: string;
  license?: string;
}

export default function LiveChatScreen({ navigation }: NativeStackScreenProps<any>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isPremium = useSelector((state: RootState) => state.portfolio.user.isPremiumUser);
  const userToken = useSelector((state: RootState) => state.portfolio.user.token);

  const [messages, setMessages] = useState<MessageItem[]>([
    { id: '1', text: 'Welcome to CapitalLoop Support. An expert helper is ready to assist you.', side: 'agent' }
  ]);
  const [input, setInput] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [assignedAdvisor, setAssignedAdvisor] = useState<AssignedAdvisorInfo | null>(null);
  const [isAdvisorTyping, setIsAdvisorTyping] = useState<boolean>(false);

  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  // ==========================================
  // 🔌 SIGNALR CONNECTION LIFECYCLE MANAGEMENT
  // ==========================================
  useEffect(() => {
    if (!isPremium || !userToken) return;

    setIsConnecting(true);

    const hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl(`${getBackendUrl()}/support-hub?access_token=${userToken}`, {
        skipNegotiation: true,
        transport: SignalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    hubConnection.on("ReceiveAgentMessage", (agentEmail: string, messagePayload: string) => {
      console.log(`✉️ Direct message received from agent: ${agentEmail}`);
      setIsAdvisorTyping(false);
      setMessages(prev => [
        ...prev, 
        { id: Math.random().toString(), text: messagePayload, side: 'agent' }
      ]);
    });

    hubConnection.on("AdvisorAssigned", (agentEmail: string, agentName: string, license: string) => {
      console.log(`👨‍💼 Advisor assigned: ${agentName} (${agentEmail}, ${license})`);
      setAssignedAdvisor({ email: agentEmail, name: agentName, license });
      setMessages(prev => [
        ...prev, 
        { 
          id: Math.random().toString(), 
          text: `🛡️ Accredited Advisor ${agentName} (${license || 'SECP Verified'}) has connected to your session.`, 
          side: 'ai' 
        }
      ]);
    });

    hubConnection.on("AdvisorReleased", () => {
      console.log("ℹ️ Advisor released session to common pool.");
      setAssignedAdvisor(null);
      setMessages(prev => [
        ...prev, 
        { 
          id: Math.random().toString(), 
          text: `ℹ️ Your conversation is in the advisory pool. Next available consultant will answer.`, 
          side: 'ai' 
        }
      ]);
    });

    hubConnection.on("UserTyping", (senderEmail: string, senderName: string, isTyping: boolean) => {
      setIsAdvisorTyping(isTyping);
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
    <View style={styles.rootWrapper}>
      {/* Institutional Top Header */}
      <InstitutionalHeader
        title="ADVISORY DESK"
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => navigation.navigate('Profile')}
      />

      {/* Slide-out Left Navigation Drawer */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={(route) => navigation.navigate(route)}
        currentRoute="LiveChat"
      />

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} 
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

      {/* Sovereign Advisor Channel Status Bar */}
      {isPremium && !isConnecting && (
        <View style={styles.advisorStatusBar}>
          {assignedAdvisor ? (
            <View style={styles.assignedAdvisorBox}>
              <View style={styles.advisorAvatarCircle}>
                <Text style={styles.advisorAvatarText}>👨‍💼</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.advisorNameText}>{assignedAdvisor.name}</Text>
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>SECP VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.advisorLicenseText}>
                  License: {assignedAdvisor.license || 'SECP-ADV-8492'} • Dedicated Channel
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.poolStatusBox}>
              <View style={styles.poolStatusDot} />
              <Text style={styles.poolStatusText}>
                Live Advisory Pool • Connected to CapitalLoop SECP Advisory Desk
              </Text>
            </View>
          )}
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

      {/* Typing Indicator Bar */}
      {isAdvisorTyping && (
        <View style={styles.typingIndicatorBar}>
          <Text style={styles.typingIndicatorText}>
            ✍️ {assignedAdvisor?.name || 'Advisor'} is typing a response...
          </Text>
        </View>
      )}

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

    {/* Persistent FinTech Bottom Navigation Bar */}
    <BottomNavBar
      activeRoute="LiveChat"
      onNavigate={(route: TabRouteName) => navigation.navigate(route)}
      unreadChatCount={0}
      isAdvisorActive={true}
    />
  </View>
);
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#0E141D',
  },
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
  advisorStatusBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  assignedAdvisorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  advisorAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  advisorAvatarText: {
    fontSize: 18,
  },
  advisorNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.2,
  },
  advisorLicenseText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  poolStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  poolStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  poolStatusText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  typingIndicatorBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  typingIndicatorText: {
    fontSize: 11,
    color: '#2563EB',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  scroller: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24
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
