import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BubbleProps {
  text: string;
  side: 'user' | 'agent' | 'ai';
}

export const ChatBubble = ({ text, side }: BubbleProps) => {
  const isUser = side === 'user';
  const isAi = side === 'ai';
  
  return (
    <View style={[styles.container, isUser ? styles.userAlign : styles.agentAlign]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBg : isAi ? styles.aiBg : styles.agentBg,
        isAi && styles.aiBorder
      ]}>
        <Text style={styles.senderLabel}>{side.toUpperCase()}</Text>
        <Text style={[styles.txt, isUser ? styles.userTxt : styles.agentTxt]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 6, flexDirection: 'row' },
  userAlign: { justifyContent: 'flex-end' },
  agentAlign: { justifyContent: 'flex-start' },
  bubble: { padding: 14, borderRadius: 16, maxWidth: '85%' },
  userBg: { backgroundColor: '#6366F1' },
  agentBg: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  aiBg: { backgroundColor: 'rgba(99, 102, 241, 0.05)' },
  aiBorder: { borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
  senderLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 4 },
  txt: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  userTxt: { color: '#FFFFFF' },
  agentTxt: { color: '#CBD5E1' }
});