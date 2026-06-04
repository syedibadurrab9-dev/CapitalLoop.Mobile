import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';

// 1. Fully-extended Button Interface Properties
interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  loading?: boolean;
  disabled?: boolean; // 👈 Added explicit disabled state control
  style?: StyleProp<ViewStyle>; // Allows passing custom overrides from parent layouts
}

export const ActionButton: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style
}) => {
  
  // 2. Resolve button operational blocking state
  const isInteractionDisabled = disabled || loading;

  // 3. Map dynamic variance layouts using optimal stylesheet utility bindings
  const buttonStyle = [
    styles.btn,
    styles[variant],
    isInteractionDisabled && styles.disabledButton,
    style // Appends dynamic custom parent overrides smoothly
  ];

  const textStyle = [
    styles.txt,
    styles[`${variant}Text`],
    isInteractionDisabled && styles.disabledText
  ];

  // 4. Resolve exact loader color token target mapping
  const getLoaderColor = (): string => {
    switch (variant) {
      case 'primary': return '#0F172A';
      case 'secondary': return '#94A3B8';
      case 'danger': return '#EF4444';
      default: return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={isInteractionDisabled}
      activeOpacity={0.7} // Provides a premium native button press response feedback
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// 5. High-Performance Static Stylesheet Configuration Matrix
const styles = StyleSheet.create({
  btn: { 
    width: '100%', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginVertical: 6, 
    borderWidth: 1, 
    borderColor: '#334155', 
    justifyContent: 'center' 
  },
  txt: { 
    fontSize: 15, 
    fontWeight: '700' 
  },
  
  // Variant Background Maps
  primary: { 
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0'
  },
  secondary: { 
    backgroundColor: '#1E293B',
    borderColor: '#334155'
  },
  accent: { 
    backgroundColor: '#6366F1',
    borderColor: 'transparent'
  },
  danger: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },

  // Variant Text Color Maps
  primaryText: { color: '#0F172A' },
  secondaryText: { color: '#94A3B8' },
  accentText: { color: '#FFFFFF' },
  dangerText: { color: '#EF4444' },

  // Interaction Blocking Utility Modifiers
  disabledButton: {
    opacity: 0.5,
    borderColor: 'transparent'
  },
  disabledText: {
    color: '#64748B'
  }
});