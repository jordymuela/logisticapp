import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import type { Carrier } from '@/domain/types';
import { CARRIER_STATUS } from '@/utils/format';

export function CarrierCard({ carrier }: { carrier: Carrier }) {
  const status = CARRIER_STATUS[carrier.status];
  const verified = carrier.docs.filter((d) => d.status === 'verifie').length;
  const missing = carrier.docs.filter((d) => d.status === 'manquant').length;
  return (
    <Card onPress={() => router.push(`/carrier/${carrier.id}`)}>
      <View style={styles.top}>
        <ThemedText style={styles.name}>{carrier.company}</ThemedText>
        <Badge label={status.label} color={status.color} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {carrier.truckType} · {carrier.truckPlate} · base {carrier.base}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Chauffeur {carrier.driverName} · documents vérifiés {verified}/{carrier.docs.length}
        {missing ? ` · ${missing} manquant${missing > 1 ? 's' : ''}` : ''}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', flex: 1 },
});
