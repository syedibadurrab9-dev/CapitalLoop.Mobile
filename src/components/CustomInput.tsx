import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  secureTextEntry?: boolean;
}

export const CustomInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  secureTextEntry = false 
}: InputProps) => {
  // Local state flag to toggle mask/unmask on demand
  const [isPasswordSecretHidden, setIsPasswordSecretHidden] = useState(secureTextEntry);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input} 
          value={value} 
          onChangeText={onChangeText}
          placeholder={placeholder} 
          placeholderTextColor="#94A3B8" /* Highly legible accessible light placeholder */
          keyboardType={keyboardType}
          secureTextEntry={isPasswordSecretHidden}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Render toggle visibility icon-button only for protected inputs */}
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setIsPasswordSecretHidden(!isPasswordSecretHidden)}
            activeOpacity={0.6}
          >
            <Text style={styles.toggleText}>
              {isPasswordSecretHidden ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 13, 
    color: '#334155', /* High-contrast clean slate ink */
    fontWeight: '600', 
    marginBottom: 8,
    letterSpacing: -0.1
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white */
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0', /* Feather-light tracking boundary lines */
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  input: { 
    flex: 1,
    color: '#0F172A', /* High-contrast elegant dark ink text input */
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 15,
    paddingRight: 64
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center'
  },
  toggleText: {
    color: '#2563EB', /* Bold institutional digital sapphire blue */
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1
  }
});