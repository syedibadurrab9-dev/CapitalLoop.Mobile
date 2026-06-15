import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useChatStore } from '../../../core/store/chat.store';
import { ChatMessageDto } from '../../../core/types/chat.types';

export default function SupportDeskScreen() {
  // ⚡ Bind directly to your global real-time SignalR socket store slice
  const { messages, isHubConnected, isLoadingHistory, initializeSignalRHubAsync, disconnectSignalRHubAsync, sendSocketMessageAsync } = useChatStore();

  // 🎛️ Local Composition States
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // 📜 Viewport Auto-Scroll Ref Handle anchor
  const scrollRefAnchor = useRef<ScrollView>(null);

  // Initialize duplex socket handshake on component mount, teardown on drop
  useEffect(() => {
    initializeSignalRHubAsync();

    return () => {
      disconnectSignalRHubAsync();
    };
  }, []);

  // Force ScrollView layout adjustments when message collections modify size
  useEffect(() => {
    if (scrollRefAnchor.current) {
      setTimeout(() => {
        scrollRefAnchor.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  /**
   * 📤 DISPATCH REAL-TIME SOCKET MESSAGING STREAM
   * Forwards raw string data frames up the WebSocket duplex channel via SignalR RPC
   */
  const handleDispatchMessageAsync = async () => {
    if (!typedMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const textToForward = typedMessage.trim();
      
      console.log("[CHAT UI LOG] Dispatching message frame to central socket matrix...");
      
      // Execute the Zustand slice action to push message up to /hubs/support
      const success = await sendSocketMessageAsync(textToForward);

      if (success) {
        setTypedMessage(''); // Clear string inputs smoothly on layout
      }
    } catch (error) {
      console.error("[CHAT UI CRASH] Failed to stream chat string:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* SOCKET NETWORK CONNECTIVITY MONITORING HEADER */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.screenTitleHeader}>Help Desk Support</Text>
          <Text style={styles.screenSubTitleHeader}>Direct Concierge Access Channel</Text>
        </View>

        <View style={styles.connectionStatusBadgeFlexRow}>
          <View style={[styles.statusBadgeDotIndicator, { backgroundColor: isHubConnected ? '#10b981' : '#f87171' }]} />
          <Text style={[styles.statusBadgeTextLabel, { color: isHubConnected ? '#10b981' : '#f87171' }]}>
            {isHubConnected ? 'Duplex Live' : 'Reconnecting'}
          </Text>
        </View>
      </View>

      {/* KEYBOARD VIEWPORTS WRAPPER PROTECTION CANVAS */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
        style={styles.keyboardAvoidingFlexWrapper}
      >
        {/* CHAT CHASSIS MESSAGE ITERATOR VIEWPORT */}
        {isLoadingHistory ? (
          <View style={styles.loadingHistoryFallbackWrapper}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingHistoryTextLabel}>Synchronizing secure conversational logs...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRefAnchor}
            contentContainerStyle={styles.scrollChatLayoutBody}
            showsVerticalScrollIndicator={true}
            onContentSizeChange={() => scrollRefAnchor.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptySupportWorkspacePlaceholder}>
                <Text style={styles.emptyTextGlyphSymbol}>💬</Text>
                <Text style={styles.emptyStateParagraphTitle}>How can we assist you today?</Text>
                <Text style={styles.emptyStateParagraphBody}>
                  Type a secure message below to engage our Shariah compliant asset desk representatives over a real-time terminal link.
                </Text>
              </View>
            ) : (
              messages.map((item: ChatMessageDto) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.chatBubbleMasterRowLayout, 
                    item.isClientMessage ? styles.rowLayoutClientAlign : styles.rowLayoutAgentAlign
                  ]}
                >
                  {/* Sender Name Signature Badge */}
                  <Text style={styles.senderBadgeMetadataName}>{item.senderName}</Text>
                  
                  {/* Interactive Bubble Framework */}
                  <View 
                    style={[
                      styles.structuralChatBubbleBodyBox,
                      item.isClientMessage ? styles.bubbleBodyClientColor : styles.bubbleBodyAgentColor
                    ]}
                  >
                    <Text style={[styles.chatPayloadTextContent, item.isClientMessage ? styles.textClientColor : styles.textAgentColor]}>
                      {item.payloadText}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* BOTTOM USER TERMINAL TEXT INPUT CONTROL SEGMENT BAR */}
        <View style={styles.bottomTerminalToolbarInputRow}>
          <TextInput
            value={typedMessage}
            onChangeText={setTypedMessage}
            placeholder="Type your support request message text..."
            placeholderTextColor="#475569"
            multiline={true}
            style={styles.terminalTextInputBoxElement}
          />

          <TouchableOpacity
            onPress={handleDispatchMessageAsync}
            disabled={!typedMessage.trim() || isSending || !isHubConnected}
            activeOpacity={0.8}
            style={[
              styles.terminalSubmitButtonBadge,
              (!typedMessage.trim() || isSending || !isHubConnected) && styles.submitButtonDisabledState
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#0c111d" />
            ) : (
              <Text style={styles.submitButtonTextIconLabel}>➔</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 REAL-TIME CHAT INTERFACE CUSTOM VISUAL STYLING ENGINE
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  screenSubTitleHeader: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  connectionStatusBadgeFlexRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  statusBadgeDotIndicator: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statusBadgeTextLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  keyboardAvoidingFlexWrapper: { flex: 1 },
  loadingHistoryFallbackWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingHistoryTextLabel: { fontSize: 12, fontWeight: '500', color: '#64748b', marginTop: 14, textAlign: 'center' },
  scrollChatLayoutBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  emptySupportWorkspacePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  emptyTextGlyphSymbol: { fontSize: 40, marginBottom: 16 },
  emptyStateParagraphTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  emptyStateParagraphBody: { fontSize: 12, fontWeight: '500', color: '#64748b', textAlign: 'center', lineHeight: 18 },
  chatBubbleMasterRowLayout: { width: '100%', marginBottom: 16, flexDirection: 'column' },
  rowLayoutClientAlign: { alignItems: 'flex-end' },
  rowLayoutAgentAlign: { alignItems: 'flex-start' },
  senderBadgeMetadataName: { fontSize: 9, fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: 4, paddingHorizontal: 4 },
  structuralChatBubbleBodyBox: { maxWidth: '85%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18 },
  bubbleBodyClientColor: { backgroundColor: '#10b981', borderBottomRightRadius: 4 }, // Emerald green for mobile client bubble frames
  bubbleBodyAgentColor: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },  // Slate gray for matching remote agent bubble blocks
  chatPayloadTextContent: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  textClientColor: { color: '#0c111d' },
  textAgentColor: { color: '#ffffff' },
  bottomTerminalToolbarInputRow: { width: '100%', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#1e293b', flexDirection: 'row', alignItems: 'center' },
  terminalTextInputBoxElement: { flex: 1, backgroundColor: '#0c111d', borderWidth: 1, borderColor: '#1e293b', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, fontSize: 13, fontWeight: '600', color: '#ffffff', maxHeight: 80, marginRight: 12 },
  terminalSubmitButtonBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabledState: { backgroundColor: '#1e293b', opacity: 0.4 },
  submitButtonTextIconLabel: { fontSize: 14, fontWeight: '900', color: '#0c111d', textAlign: 'center' }
});