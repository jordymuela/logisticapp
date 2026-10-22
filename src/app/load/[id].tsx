import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { QuoteSummary } from '@/components/quote-summary';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { StatusTimeline } from '@/components/status-timeline';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { distanceKm } from '@/domain/pricing';
import { useStore } from '@/store/app-store';
import { LOAD_STATUS, formatDate, formatUSD } from '@/utils/format';

export default function LoadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadById, carrierById, role, activeCarrier, dispatch } = useStore();
  const load = loadById(id);

  if (!load) {
    return (
      <Screen inStack>
        <ThemedText themeColor="textSecondary">Chargement introuvable.</ThemedText>
      </Screen>
    );
  }

  const status = LOAD_STATUS[load.status];
  const carrier = carrierById(load.carrierId);
  const isMyMission = role === 'carrier' && load.carrierId === activeCarrier.id;

  function reject() {
    Alert.alert('Motif du rejet', 'Choisissez un motif', [
      { text: 'Documents incomplets', onPress: () => dispatch({ type: 'rejectLoad', id: load!.id, reason: 'documents incomplets' }) },
      { text: 'Valeur déclarée incohérente', onPress: () => dispatch({ type: 'rejectLoad', id: load!.id, reason: 'valeur déclarée incohérente' }) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  function accept() {
    if (activeCarrier.status !== 'approuve') {
      Alert.alert('Dossier non approuvé', 'Votre dossier doit être approuvé par l\'administrateur avant d\'accepter une mission.');
      return;
    }
    dispatch({ type: 'acceptMission', id: load!.id, carrierId: activeCarrier.id });
  }

  return (
    <Screen inStack>
      <Stack.Screen options={{ title: load.reference }} />
      <Card>
        <View style={styles.top}>
          <ThemedText type="code" themeColor="textSecondary">{load.reference}</ThemedText>
          <Badge label={status.label} color={status.color} />
        </View>
        <ThemedText style={styles.route}>
          {load.origin} → {load.destination}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {distanceKm(load.origin, load.destination).toLocaleString('fr-FR')} km indicatifs · expéditeur {load.shipperName}
        </ThemedText>
        <View style={styles.grid}>
          <Cell label="Cargaison" value={load.cargoType} />
          <Cell label="Poids" value={`${load.weightT} t`} />
          <Cell label="Volume" value={`${load.volumeM3} m³`} />
          <Cell label="Valeur déclarée" value={formatUSD(load.estimatedValue)} />
          <Cell label="Assurance" value={load.insured ? 'Souscrite' : 'Non'} />
          <Cell label="Échéance" value={formatDate(load.deadline)} />
        </View>
        <ThemedText type="small">{load.description}</ThemedText>
      </Card>

      <QuoteSummary truckPrice={load.truckPrice} adminFee={load.adminFee} insurancePremium={load.insurancePremium} insured={load.insured} />

      {carrier ? (
        <>
          <SectionHeader title="Camion assigné" />
          <Card onPress={() => router.push(`/carrier/${carrier.id}`)}>
            <ThemedText type="smallBold">{carrier.company}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {carrier.truckType} · {carrier.truckPlate}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Chauffeur {carrier.driverName} · {carrier.driverPhone}
            </ThemedText>
          </Card>
        </>
      ) : null}

      <SectionHeader title="Suivi" />
      <Card>
        <StatusTimeline load={load} />
      </Card>

      {role === 'admin' && load.status === 'en_attente' ? (
        <View style={styles.actions}>
          <Button title="Valider et publier" onPress={() => dispatch({ type: 'validateLoad', id: load.id })} />
          <Button title="Rejeter" variant="danger" onPress={reject} />
        </View>
      ) : null}
      {role === 'carrier' && load.status === 'valide' ? (
        <Button title={`Accepter la mission · ${formatUSD(load.truckPrice)}`} onPress={accept} />
      ) : null}
      {isMyMission && load.status === 'assigne' ? (
        <Button title="Démarrer le transport" onPress={() => dispatch({ type: 'startTransit', id: load.id })} />
      ) : null}
      {isMyMission && load.status === 'en_transit' ? (
        <Button title="Confirmer la livraison" onPress={() => dispatch({ type: 'confirmDelivery', id: load.id })} />
      ) : null}
      {role === 'shipper' && load.status === 'en_attente' ? (
        <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
          En attente de la revue de conformité par l’administrateur.
        </ThemedText>
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
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  cell: { width: '47%' },
  actions: { gap: Spacing.two },
});
