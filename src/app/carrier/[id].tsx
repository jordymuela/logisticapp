import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DocRow } from '@/components/doc-row';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { DocKey } from '@/domain/types';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS, formatDate } from '@/utils/format';
import { pickDocumentImage } from '@/utils/pick-document';

export default function CarrierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carrierById, role, activeCarrier, loads, dispatch } = useStore();
  const c = carrierById(id);

  if (!c) {
    return (
      <Screen inStack>
        <ThemedText themeColor="textSecondary">Transporteur introuvable.</ThemedText>
      </Screen>
    );
  }

  const status = CARRIER_STATUS[c.status];
  const isAdmin = role === 'admin';
  const isOwner = role === 'carrier' && activeCarrier.id === c.id;
  const blocking = c.docs.filter((d) => d.status === 'manquant' || d.status === 'rejete');
  const completed = loads.filter((l) => l.carrierId === c.id && l.status === 'livre').length;

  async function upload(key: DocKey) {
    const uri = await pickDocumentImage();
    if (uri) dispatch({ type: 'setCarrierDoc', carrierId: c!.id, key, uri });
  }

  function rejectCarrier() {
    Alert.alert('Motif du rejet', 'Choisissez un motif', [
      { text: 'Assurance expirée', onPress: () => dispatch({ type: 'rejectCarrier', id: c!.id, reason: 'assurance expirée' }) },
      { text: 'Documents illisibles', onPress: () => dispatch({ type: 'rejectCarrier', id: c!.id, reason: 'documents illisibles' }) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  return (
    <Screen inStack>
      <Stack.Screen options={{ title: c.company }} />
      <Card>
        <View style={styles.top}>
          <ThemedText style={styles.name}>{c.company}</ThemedText>
          <Badge label={status.label} color={status.color} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Inscrit le {formatDate(c.registeredAt)} · base {c.base} · {completed} livraison(s)
        </ThemedText>
        {c.note ? <ThemedText type="small" themeColor="danger">Motif : {c.note}</ThemedText> : null}
        <View style={styles.grid}>
          <Cell label="Camion" value={c.truckType} />
          <Cell label="Immatriculation" value={c.truckPlate} />
          <Cell label="Capacité" value={`${c.capacityT} t`} />
          <Cell label="Téléphone" value={c.phone} />
          <Cell label="Chauffeur" value={c.driverName} />
          <Cell label="Tél. chauffeur" value={c.driverPhone} />
        </View>
      </Card>

      <SectionHeader title="Documents de conformité" />
      <Card style={{ gap: 0 }}>
        {c.docs.map((d) => (
          <DocRow
            key={d.key}
            doc={d}
            actionLabel={
              isAdmin && d.status === 'televerse' ? 'Vérifier' : isOwner && d.status !== 'verifie' ? (d.uri ? 'Remplacer' : 'Téléverser') : undefined
            }
            onAction={isAdmin ? () => dispatch({ type: 'reviewDoc', carrierId: c.id, key: d.key, status: 'verifie' }) : () => upload(d.key)}
            secondaryLabel={isAdmin && (d.status === 'televerse' || d.status === 'verifie') ? 'Rejeter' : undefined}
            onSecondary={() => dispatch({ type: 'reviewDoc', carrierId: c.id, key: d.key, status: 'rejete' })}
          />
        ))}
      </Card>

      {isAdmin && c.status !== 'approuve' ? (
        <View style={styles.actions}>
          {blocking.length ? (
            <ThemedText type="small" themeColor="warning">
              {blocking.length} document(s) manquant(s) ou rejeté(s) : approbation impossible.
            </ThemedText>
          ) : null}
          <Button title="Approuver le transporteur" disabled={blocking.length > 0} onPress={() => dispatch({ type: 'approveCarrier', id: c.id })} />
          {c.status !== 'rejete' ? <Button title="Rejeter le dossier" variant="danger" onPress={rejectCarrier} /> : null}
        </View>
      ) : null}
    </Screen>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  name: { fontSize: 20, fontWeight: '800', flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  cell: { width: '47%' },
  actions: { gap: Spacing.two },
});
