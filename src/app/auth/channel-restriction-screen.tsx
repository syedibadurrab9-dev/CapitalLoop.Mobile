import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../core/store/auth.store';

export default function ChannelRestrictionScreen() {
  const router = useRouter();
  const terminateSessionAsync = useAuthStore((state) => state.terminateSessionAsync);

  const handleEgressRecoveryLoopAsync = async () => {
    // Completely wipe session tokens and return cleanly to standard login lanes
    await terminateSessionAsync();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <View style={styles.centralLockAlertCard}>
        <View style={styles.lockBadgeIconBox}>
          <Text style={styles.lockEmblemGlyph}>🔒</Text>
        </View>
        
        <View style={styles.textStack}>
          <Text style={styles.restrictionTitleHeader}>Mobile Channel Locked</Text>
          <Text style={styles.restrictionBodyParagraph}>
            Your assigned enterprise account contains institutional wealth manager, advisory, or back-office auditor data parameters.
          </Text>
          <Text style={styles.restrictedTechnicalGuidance}>
            To protect tenant auditing bounds, your profile must execute transactions strictly on the CapitalLoop Angular Web Management Portal dashboard station.
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleEgressRecoveryLoopAsync}
        activeOpacity={0.8}
        style={styles.returnButtonLayout}
      >
        <Text style={styles.returnButtonTextLabel}>Return to Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masterContainer: { 
    flex: 1, 
    backgroundColor: '#0c111d', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24 
  },
  centralLockAlertCard: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%', 
    paddingHorizontal: 12 
  },
  lockBadgeIconBox: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: 'rgba(239, 68, 68, 0.08)', 
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.2)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  lockEmblemGlyph: { 
    fontSize: 24, 
    textAlign: 'center' 
  },
  textStack: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%'
  },
  restrictionTitleHeader: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#ffffff', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  restrictionBodyParagraph: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: '#94a3b8', 
    textAlign: 'center', 
    lineHeight: 18, 
    marginBottom: 16 
  },
  restrictedTechnicalGuidance: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: '#10b981', 
    backgroundColor: '#064e3b', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#047857', 
    textAlign: 'center', 
    lineHeight: 15, 
    overflow: 'hidden' 
  },
  returnButtonLayout: { 
    width: '100%', 
    backgroundColor: '#1e293b', 
    paddingVertical: 16, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginBottom: 20 
  },
  returnButtonTextLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#94a3b8' 
  }
});