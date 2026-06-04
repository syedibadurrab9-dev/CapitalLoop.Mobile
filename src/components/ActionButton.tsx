import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';

// 1. Fully-extended Button Interface Properties
interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
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
    style
  ];

  const textStyle = [
    styles.txt,
    styles[`${variant}Text`],
    isInteractionDisabled && styles.disabledText
  ];

  // 4. Resolve exact loader color token target mapping matching our light theme canvas
  const getLoaderColor = (): string => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#2563EB';
      case 'accent': return '#FFFFFF';
      case 'danger': return '#DC2626';
      default: return '#0F172A';
    }
  };

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// 5. Light-Mode High-Performance Static Stylesheet Matrix
const styles = StyleSheet.create({
  btn: { 
    width: '100%', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginVertical: 6, 
    borderWidth: 1, 
    justifyContent: 'center' 
  },
  txt: { 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: -0.1
  },
  
  // Premium Tactile Light Variant Profiles
  primary: { 
    backgroundColor: '#0F172A', /* Deep elegant midnight slate fill */
    borderColor: '#0F172A'
  },
  secondary: { 
    backgroundColor: '#FFFFFF', /* Soft floating glass canvas block */
    borderColor: '#E2E8F0'
  },
  accent: { 
    backgroundColor: '#2563EB', /* Vibrant institutional digital sapphire blue */
    borderColor: 'transparent'
  },
  danger: { 
    backgroundColor: '#FEF2F2', /* Muted premium rose background */
    borderColor: '#FEE2E2'
  },

  // Premium Typographic Mappings
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: '#334155' },
  accentText: { color: '#FFFFFF' },
  dangerText: { color: '#DC2626' },

  // Interaction State Modifiers
  disabledButton: {
    backgroundColor: '#E2E8F0',
    borderColor: 'transparent',
    opacity: 0.6
  },
  disabledText: {
    color: '#94A3B8'
  }
});