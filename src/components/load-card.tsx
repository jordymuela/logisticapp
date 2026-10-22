import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { quoteTotal } from '@/domain/pricing';
import type { Load } from '@/domain/types';
import { LOAD_STATUS, formatDate, formatUSD } from '@/utils/format';

export function LoadCard({ load, showShipper, priceMode = 'total' }: { load: Load; showShipper?: boolean; priceMode?: 'total' | 'truck' }) {
  const status = LOAD_STATUS[load.status];
  const price = priceMode === 'truck' ? load.truckPrice : quoteTotal(load);
  return (
    <Card onPress={() => router.push(`/load/${load.id}`)}>
      <View style={styles.top}>
        <ThemedText type="code" themeColor="textSecondary">{load.reference}</ThemedText>
        <Badge label={status.label} color={status.color} />
      </View>
      <ThemedText style={styles.route}>
        {load.origin} → {load.destination}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {load.cargoType} · {load.weightT} t · {load.description}
      </ThemedText>
      <View style={styles.bottom}>
        <ThemedText type="small" themeColor="textSecondary">
          {showShipper ? load.shipperName : `Échéance ${formatDate(load.deadline)}`}
        </ThemedText>
        <ThemedText type="smallBold">{formatUSD(price)}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
});
