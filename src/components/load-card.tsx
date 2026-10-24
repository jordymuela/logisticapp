import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { quoteTotal } from '@/domain/pricing';
import type { Load } from '@/domain/types';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { LOAD_STATUS_COLOR, formatDate, formatUSD } from '@/utils/format';

export function LoadCard({ load, showShipper, priceMode = 'total' }: { load: Load; showShipper?: boolean; priceMode?: 'total' | 'truck' }) {
  const { t, lang } = useI18n();
  const price = priceMode === 'truck' ? load.truckPrice : quoteTotal(load);
  return (
    <Card onPress={() => router.push(`/load/${load.id}`)}>
      <View style={styles.top}>
        <ThemedText type="code" themeColor="textSecondary">{load.reference}</ThemedText>
        <Badge label={t(`status_${load.status}` as StringKey)} color={LOAD_STATUS_COLOR[load.status]} />
      </View>
      <ThemedText style={styles.route}>
        {load.origin} → {load.destination}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {load.cargoType} · {load.weightT} t · {load.description}
      </ThemedText>
      <View style={styles.bottom}>
        <ThemedText type="small" themeColor="textSecondary">
          {showShipper ? load.shipperName : t('deadlineShort', { date: formatDate(load.deadline, lang) })}
        </ThemedText>
        <ThemedText type="smallBold">{formatUSD(price, lang)}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
});
