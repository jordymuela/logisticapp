import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

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
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { uploadDocumentImage } from '@/services/storage';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS_COLOR } from '@/utils/format';
import { pickDocumentImage } from '@/utils/pick-document';

export default function Fleet() {
  const { activeCarrier: c, dispatch } = useStore();
  const { t } = useI18n();
  const [busy, setBusy] = useState<DocKey | null>(null);

  async function upload(key: DocKey) {
    const local = await pickDocumentImage(t);
    if (!local) return;
    setBusy(key);
    try {
      const uri = await uploadDocumentImage(local, c.id, key);
      dispatch({ type: 'setCarrierDoc', carrierId: c.id, key, uri });
    } catch {
      Alert.alert(t('uploadFailed'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen title={t('myTruck')} subtitle={c.company}>
      <Card>
        <View style={styles.top}>
          <ThemedText style={styles.plate}>{c.truckPlate}</ThemedText>
          <Badge label={t(`carrier_${c.status}` as StringKey)} color={CARRIER_STATUS_COLOR[c.status]} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {c.truckType} · {c.capacityT} t · {t('baseLine', { base: c.base })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('driverLine', { name: c.driverName, phone: c.driverPhone })}
        </ThemedText>
      </Card>
      <SectionHeader title={t('complianceDocs')} />
      <Card style={{ gap: 0 }}>
        {c.docs.map((d) => (
          <DocRow
            key={d.key}
            doc={d}
            busy={busy === d.key}
            actionLabel={d.status === 'verifie' ? undefined : d.uri ? t('replace') : t('upload')}
            onAction={() => upload(d.key)}
          />
        ))}
      </Card>
      <ThemedText type="small" themeColor="textSecondary">{t('docsHint')}</ThemedText>
      <Button title={t('registerAnother')} variant="secondary" onPress={() => router.push('/register-truck')} />
      <RoleFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  plate: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
});
