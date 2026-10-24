import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import type { Carrier } from '@/domain/types';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { CARRIER_STATUS_COLOR } from '@/utils/format';

export function CarrierCard({ carrier }: { carrier: Carrier }) {
  const { t } = useI18n();
  const verified = carrier.docs.filter((d) => d.status === 'verifie').length;
  const missing = carrier.docs.filter((d) => d.status === 'manquant').length;
  return (
    <Card onPress={() => router.push(`/carrier/${carrier.id}`)}>
      <View style={styles.top}>
        <ThemedText style={styles.name}>{carrier.company}</ThemedText>
        <Badge label={t(`carrier_${carrier.status}` as StringKey)} color={CARRIER_STATUS_COLOR[carrier.status]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {carrier.truckType} · {carrier.truckPlate} · {t('baseLine', { base: carrier.base })}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('driver')} {carrier.driverName} · {t('docsVerified', { v: verified, n: carrier.docs.length })}
        {missing ? ` · ${t('missingCount', { n: missing })}` : ''}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', flex: 1 },
});
