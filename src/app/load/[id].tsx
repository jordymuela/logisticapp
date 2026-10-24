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
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { useStore } from '@/store/app-store';
import { LOAD_STATUS_COLOR, formatDate, formatUSD } from '@/utils/format';

export default function LoadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadById, carrierById, role, activeCarrier, dispatch } = useStore();
  const { t, lang } = useI18n();
  const load = loadById(id);

  if (!load) {
    return (
      <Screen inStack>
        <ThemedText themeColor="textSecondary">{t('notFoundLoad')}</ThemedText>
      </Screen>
    );
  }

  const carrier = carrierById(load.carrierId);
  const isMyMission = role === 'carrier' && load.carrierId === activeCarrier.id;
  const loadId = load.id;

  function reject() {
    Alert.alert(t('rejectReasonTitle'), t('chooseReason'), [
      { text: t('reasonDocsIncomplete'), onPress: () => dispatch({ type: 'rejectLoad', id: loadId, reason: 'reasonDocsIncomplete' }) },
      { text: t('reasonValueInconsistent'), onPress: () => dispatch({ type: 'rejectLoad', id: loadId, reason: 'reasonValueInconsistent' }) },
      { text: t('cancel'), style: 'cancel' },
    ]);
  }

  function accept() {
    if (activeCarrier.status !== 'approuve') {
      Alert.alert(t('notApprovedTitle'), t('notApprovedMsg'));
      return;
    }
    dispatch({ type: 'acceptMission', id: loadId, carrierId: activeCarrier.id });
  }

  return (
    <Screen inStack>
      <Stack.Screen options={{ title: load.reference }} />
      <Card>
        <View style={styles.top}>
          <ThemedText type="code" themeColor="textSecondary">{load.reference}</ThemedText>
          <Badge label={t(`status_${load.status}` as StringKey)} color={LOAD_STATUS_COLOR[load.status]} />
        </View>
        <ThemedText style={styles.route}>
          {load.origin} → {load.destination}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('kmIndicative', { km: distanceKm(load.origin, load.destination).toLocaleString(lang === 'pt' ? 'pt-PT' : 'fr-FR'), shipper: load.shipperName })}
        </ThemedText>
        <View style={styles.grid}>
          <Cell label={t('cargo')} value={load.cargoType} />
          <Cell label={t('weight')} value={`${load.weightT} t`} />
          <Cell label={t('volume')} value={`${load.volumeM3} m³`} />
          <Cell label={t('declaredValue')} value={formatUSD(load.estimatedValue, lang)} />
          <Cell label={t('insurance')} value={load.insured ? t('subscribed') : t('no')} />
          <Cell label={t('deadline')} value={formatDate(load.deadline, lang)} />
        </View>
        <ThemedText type="small">{load.description}</ThemedText>
      </Card>

      <QuoteSummary truckPrice={load.truckPrice} adminFee={load.adminFee} insurancePremium={load.insurancePremium} insured={load.insured} />

      {carrier ? (
        <>
          <SectionHeader title={t('assignedTruck')} />
          <Card onPress={() => router.push(`/carrier/${carrier.id}`)}>
            <ThemedText type="smallBold">{carrier.company}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {carrier.truckType} · {carrier.truckPlate}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('driverLine', { name: carrier.driverName, phone: carrier.driverPhone })}
            </ThemedText>
          </Card>
        </>
      ) : null}

      <SectionHeader title={t('tracking')} />
      <Card>
        <StatusTimeline load={load} />
      </Card>

      {role === 'admin' && load.status === 'en_attente' ? (
        <View style={styles.actions}>
          <Button title={t('validateAndPublish')} onPress={() => dispatch({ type: 'validateLoad', id: loadId })} />
          <Button title={t('reject')} variant="danger" onPress={reject} />
        </View>
      ) : null}
      {role === 'carrier' && load.status === 'valide' ? (
        <Button title={t('acceptMission', { price: formatUSD(load.truckPrice, lang) })} onPress={accept} />
      ) : null}
      {isMyMission && load.status === 'assigne' ? (
        <Button title={t('startTransport')} onPress={() => dispatch({ type: 'startTransit', id: loadId })} />
      ) : null}
      {isMyMission && load.status === 'en_transit' ? (
        <Button title={t('confirmDelivery')} onPress={() => dispatch({ type: 'confirmDelivery', id: loadId })} />
      ) : null}
      {role === 'shipper' && load.status === 'en_attente' ? (
        <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
          {t('waitingReview')}
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
