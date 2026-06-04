import React, { useState } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleCurrency, triggerApiSync, clearAuth } from '../store/portfolioSlice';
import { PaywallModal } from '../components/PaywallModal';
import { TickerTapeBar } from '../components/TickerTapeBar';
import { AssetSummaryCard } from '../components/AssetSummaryCard';
import { PortfolioChart } from '../components/PortfolioChart'; 
import { ActionButton } from '../components/ActionButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function DashboardScreen({ navigation }: NativeStackScreenProps<any>) {
  // Explicitly cast to AppDispatch to support async thunk actions smoothly when required
  const dispatch = useDispatch<AppDispatch>();
  const [paywall, setPaywall] = useState(false);
  
  const { 
    assets, 
    currencyToggle, 
    pkrToUsdRate, 
    user, 
    goldPricePKR, 
    silverPricePKR 
  } = useSelector((state: RootState) => state.portfolio);

  const totalPKR = assets.reduce((sum, item) => sum + item.holdingValuePKR, 0);

  const displayNetWorth = () => {
    return currencyToggle === 'PKR' 
      ? `Rs. ${totalPKR.toLocaleString()}` 
      : `$ ${(totalPKR / pkrToUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleSync = () => {
    if (!user.isPremiumUser) {
      setPaywall(true);
      return;
    }
    
    // ✅ FIXED: Enclosed slice-reducer execution safely within the callback
    dispatch(triggerApiSync());
    Alert.alert('API Ledger Synced', 'Live balances downloaded via AKD, Binance, and Bank Al Habib APIs.');
  };

  return (
    <View style={styles.wrapper}>
      <TickerTapeBar gold={goldPricePKR} silver={silverPricePKR} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Identity Token Verified</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.pill} 
            onPress={() => !user.isPremiumUser && setPaywall(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillTxt, { color: user.isPremiumUser ? '#10B981' : '#F59E0B' }]}>
              {user.isPremiumUser ? 'PRO ACTIVE' : 'UPGRADE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aggregate Net Worth Card Frame */}
        <View style={styles.worthCard}>
          <View style={styles.worthRow}>
            <Text style={styles.worthLabel}>CONSOLIDATED ACCOUNT EQUITY</Text>
            {/* ✅ FIXED: Wrapped in an arrow function block to satisfy the click return target signature */}
            <TouchableOpacity style={styles.currPill} onPress={() => dispatch(toggleCurrency())}>
              <Text style={styles.currTxt}>{currencyToggle}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.worthValue}>{displayNetWorth()}</Text>
        </View>

        {/* Dynamic Asset Density Matrix Visualizer Chart */}
        {assets.length > 0 && <PortfolioChart assets={assets} />}

        {/* Navigation Action Management Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCell} onPress={() => navigation.navigate('AssetInput')}>
            <Text style={styles.cellIcon}>📝</Text>
            <Text style={styles.cellTxt}>Sync Hub</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridCell} onPress={handleSync}>
            <Text style={styles.cellIcon}>🔄</Text>
            <Text style={styles.cellTxt}>Auto API Sync</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridCell} onPress={() => user.isPremiumUser ? navigation.navigate('LiveCharts') : setPaywall(true)}>
            <Text style={styles.cellIcon}>📈</Text>
            <Text style={styles.cellTxt}>Live Charts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridCell} onPress={() => navigation.navigate('AiAdvisor')}>
            <Text style={styles.cellIcon}>🤖</Text>
            <Text style={styles.cellTxt}>AI Advisor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridCell} onPress={() => navigation.navigate('KycRoute')}>
            <Text style={styles.cellIcon}>🆔</Text>
            <Text style={styles.cellTxt}>KYC Portal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridCell} onPress={() => navigation.navigate('LiveChat')}>
            <Text style={styles.cellIcon}>💬</Text>
            <Text style={styles.cellTxt}>Support Hub</Text>
          </TouchableOpacity>
        </View>

        {/* Detailed Item Ledger Cards Track */}
        <Text style={styles.listHeader}>Portfolio Dynamic Ledger</Text>
        {assets.map((asset) => (
          <AssetSummaryCard
            key={asset.id}
            name={asset.name}
            category={asset.category}
            isAutoSynced={asset.isAutoSynced}
            valueDisplay={
              currencyToggle === 'PKR' 
                ? `Rs ${asset.holdingValuePKR.toLocaleString()}` 
                : `$ ${(asset.holdingValuePKR / pkrToUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
          />
        ))}

        {/* Safe Session Disconnection Controller */}
        <View style={styles.spacing}>
          {/* ✅ FIXED: Bound dispatch directly inside an anonymous wrapper to safely match void expectations */}
          <ActionButton title="Disconnect Enterprise Session" onPress={() => { dispatch(clearAuth()); }} variant="danger" />
        </View>
        
        <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1 },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  pill: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  pillTxt: { fontSize: 11, fontWeight: '800' },
  worthCard: { backgroundColor: '#1E293B', padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  worthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  worthLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5 },
  currPill: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  currTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  worthValue: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 12, letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 },
  gridCell: { width: '31%', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cellIcon: { fontSize: 22, marginBottom: 6 },
  cellTxt: { color: '#F8FAFC', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  listHeader: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 14, letterSpacing: 0.75 },
  spacing: { marginTop: 20 }
});