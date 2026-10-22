import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DocRow } from '@/components/doc-row';
import { RoleFooter } from '@/components/role-footer';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { DocKey } from '@/domain/types';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS } from '@/utils/format';
import { pickDocumentImage } from '@/utils/pick-document';

export default function Fleet() {
  const { activeCarrier: c, dispatch } = useStore();
  const status = CARRIER_STATUS[c.status];

  async function upload(key: DocKey) {
    const uri = await pickDocumentImage();
    if (uri) dispatch({ type: 'setCarrierDoc', carrierId: c.id, key, uri });
  }

  return (
    <Screen title="Mon camion" subtitle={c.company}>
      <Card>
        <View style={styles.top}>
          <ThemedText style={styles.plate}>{c.truckPlate}</ThemedText>
          <Badge label={status.label} color={status.color} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {c.truckType} · {c.capacityT} t · base {c.base}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Chauffeur {c.driverName} · {c.driverPhone}
        </ThemedText>
      </Card>
      <SectionHeader title="Documents de conformité" />
      <Card style={{ gap: 0 }}>
        {c.docs.map((d) => (
          <DocRow
            key={d.key}
            doc={d}
            actionLabel={d.status === 'verifie' ? undefined : d.uri ? 'Remplacer' : 'Téléverser'}
            onAction={() => upload(d.key)}
          />
        ))}
      </Card>
      <ThemedText type="small" themeColor="textSecondary">
        AFEGEME et carte rose concernent le camion, DGM et permis concernent le chauffeur. L’administrateur vérifie chaque document avant approbation.
      </ThemedText>
      <Button title="Inscrire un autre camion" variant="secondary" onPress={() => router.push('/register-truck')} />
      <RoleFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  plate: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
});
