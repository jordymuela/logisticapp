import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { uploadDocumentImage } from '@/services/storage';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS_COLOR, formatDate } from '@/utils/format';
import { pickDocumentImage } from '@/utils/pick-document';

export default function CarrierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carrierById, role, activeCarrier, loads, dispatch } = useStore();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState<DocKey | null>(null);
  const c = carrierById(id);

  if (!c) {
    return (
      <Screen inStack>
        <ThemedText themeColor="textSecondary">{t('notFoundCarrier')}</ThemedText>
      </Screen>
    );
  }

  const carrierId = c.id;
  const isAdmin = role === 'admin';
  const isOwner = role === 'carrier' && activeCarrier.id === c.id;
  const blocking = c.docs.filter((d) => d.status === 'manquant' || d.status === 'rejete');
  const completed = loads.filter((l) => l.carrierId === c.id && l.status === 'livre').length;
  const noteText = c.note && c.note.startsWith('reason') ? t(c.note as StringKey) : c.note;

  async function upload(key: DocKey) {
    const local = await pickDocumentImage(t);
    if (!local) return;
    setBusy(key);
    try {
      const uri = await uploadDocumentImage(local, carrierId, key);
      dispatch({ type: 'setCarrierDoc', carrierId, key, uri });
    } catch {
      Alert.alert(t('uploadFailed'));
    } finally {
      setBusy(null);
    }
  }

  function rejectCarrier() {
    Alert.alert(t('rejectReasonTitle'), t('chooseReason'), [
      { text: t('reasonInsuranceExpired'), onPress: () => dispatch({ type: 'rejectCarrier', id: carrierId, reason: 'reasonInsuranceExpired' }) },
      { text: t('reasonIllegible'), onPress: () => dispatch({ type: 'rejectCarrier', id: carrierId, reason: 'reasonIllegible' }) },
      { text: t('cancel'), style: 'cancel' },
    ]);
  }

  return (
    <Screen inStack>
      <Stack.Screen options={{ title: c.company }} />
      <Card>
        <View style={styles.top}>
          <ThemedText style={styles.name}>{c.company}</ThemedText>
          <Badge label={t(`carrier_${c.status}` as StringKey)} color={CARRIER_STATUS_COLOR[c.status]} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {t('registeredLine', { date: formatDate(c.registeredAt, lang), base: c.base, n: completed })}
        </ThemedText>
        {noteText ? <ThemedText type="small" themeColor="danger">{t('reasonLine', { note: noteText })}</ThemedText> : null}
        <View style={styles.grid}>
          <Cell label={t('truck')} value={c.truckType} />
          <Cell label={t('plate')} value={c.truckPlate} />
          <Cell label={t('capacity')} value={`${c.capacityT} t`} />
          <Cell label={t('phone')} value={c.phone} />
          <Cell label={t('driver')} value={c.driverName} />
          <Cell label={t('driverPhone')} value={c.driverPhone} />
        </View>
      </Card>

      <SectionHeader title={t('complianceDocs')} />
      <Card style={{ gap: 0 }}>
        {c.docs.map((d) => (
          <DocRow
            key={d.key}
            doc={d}
            busy={busy === d.key}
            actionLabel={
              isAdmin && d.status === 'televerse' ? t('verify') : isOwner && d.status !== 'verifie' ? (d.uri ? t('replace') : t('upload')) : undefined
            }
            onAction={isAdmin ? () => dispatch({ type: 'reviewDoc', carrierId, key: d.key, status: 'verifie' }) : () => upload(d.key)}
            secondaryLabel={isAdmin && (d.status === 'televerse' || d.status === 'verifie') ? t('reject') : undefined}
            onSecondary={() => dispatch({ type: 'reviewDoc', carrierId, key: d.key, status: 'rejete' })}
          />
        ))}
      </Card>

      {isAdmin && c.status !== 'approuve' ? (
        <View style={styles.actions}>
          {blocking.length ? (
            <ThemedText type="small" themeColor="warning">{t('blockingDocs', { n: blocking.length })}</ThemedText>
          ) : null}
          <Button title={t('approveCarrier')} disabled={blocking.length > 0} onPress={() => dispatch({ type: 'approveCarrier', id: carrierId })} />
          {c.status !== 'rejete' ? <Button title={t('rejectCarrier')} variant="danger" onPress={rejectCarrier} /> : null}
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
