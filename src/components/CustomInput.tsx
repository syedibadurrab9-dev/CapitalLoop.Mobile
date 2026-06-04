import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  secureTextEntry?: boolean; // Added support for password/secret key inputs
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
          placeholderTextColor="#475569" 
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
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>
              {isPasswordSecretHidden ? 'SHOW' : 'HIDE'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { marginBottom: 18 },
  label: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: '700', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.75 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative'
  },
  input: { 
    flex: 1,
    color: '#FFFFFF', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 15,
    paddingRight: 64 // Prevent textual content from clipping behind the toggle text
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center'
  },
  toggleText: {
    color: '#38BDF8', // Cyan-blue theme color for interactable actions
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});