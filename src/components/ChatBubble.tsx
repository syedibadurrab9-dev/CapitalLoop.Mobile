import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BubbleProps {
  text: string;
  side: 'user' | 'agent' | 'ai';
}

export const ChatBubble = ({ text, side }: BubbleProps) => {
  const isUser = side === 'user';
  const isAi = side === 'ai';

  const isConsultantVerified = text.startsWith('[Verified');
  let cleanText = text;
  let consultantBadge = '';

  if (isConsultantVerified) {
    const endBracket = text.indexOf(']');
    if (endBracket !== -1) {
      consultantBadge = text.substring(1, endBracket);
      cleanText = text.substring(endBracket + 1).trim();
    }
  }

  // Human-friendly sender label mapping
  const getSenderLabel = () => {
    switch (side) {
      case 'user': return 'You';
      case 'agent': return consultantBadge ? `🛡️ ${consultantBadge}` : 'Priority Support Agent';
      case 'ai': return 'AI Wealth Insights';
      default: return '';
    }
  };
  
  return (
    <View style={[styles.container, isUser ? styles.userAlign : styles.agentAlign]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBg : isAi ? styles.aiBg : styles.agentBg,
        isConsultantVerified ? styles.verifiedAgentBorder : null
      ]}>
        <Text style={[styles.senderLabel, isUser ? styles.userLabelTxt : isConsultantVerified ? styles.verifiedLabelTxt : styles.agentLabelTxt]}>
          {getSenderLabel()}
        </Text>
        <Text style={[styles.txt, isUser ? styles.userTxt : isAi ? styles.aiTxt : styles.agentTxt]}>
          {cleanText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    marginVertical: 8, 
    flexDirection: 'row' 
  },
  userAlign: { 
    justifyContent: 'flex-end' 
  },
  agentAlign: { 
    justifyContent: 'flex-start' 
  },
  bubble: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 20, 
    maxWidth: '80%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  
  // Custom Light Variant Configurations
  userBg: { 
    backgroundColor: '#2563EB', /* Vibrant digital sapphire blue */
    borderBottomRightRadius: 4 /* Clean tail accent effect */
  },
  agentBg: { 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white */
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4 
  },
  aiBg: { 
    backgroundColor: '#F0FDF4', /* Organic mint glass canvas tint */
    borderWidth: 1, 
    borderColor: '#E6F4EA',
    borderBottomLeftRadius: 4
  },

  // Metadata Labels Typography Configuration
  senderLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    marginBottom: 4,
    letterSpacing: -0.1
  },
  userLabelTxt: { 
    color: 'rgba(255, 255, 255, 0.75)' 
  },
  agentLabelTxt: { 
    color: '#64748B' 
  },
  verifiedLabelTxt: {
    color: '#059669',
    fontWeight: '700'
  },
  verifiedAgentBorder: {
    borderColor: '#6EE7B7',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4'
  },

  // Main Bubble Message Prose Configuration
  txt: { 
    fontSize: 14, 
    lineHeight: 21, 
    fontWeight: '500',
    letterSpacing: -0.1
  },
  userTxt: { 
    color: '#FFFFFF' 
  },
  agentTxt: { 
    color: '#334155' /* Premium slate ink */
  },
  aiTxt: { 
    color: '#15803D' /* Deep emerald safe text rendering */
  }
});