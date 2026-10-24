import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChipSelect } from '@/components/chip-select';
import { DocRow } from '@/components/doc-row';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DOC_TEMPLATES, HUBS, TRUCK_TYPES, type DocKey, type Hub, type TruckType } from '@/domain/types';
import { useI18n } from '@/i18n';
import { uploadDocumentImage } from '@/services/storage';
import { useStore } from '@/store/app-store';
import { pickDocumentImage } from '@/utils/pick-document';

export default function RegisterTruck() {
  const { dispatch } = useStore();
  const { t } = useI18n();
  const [carrierId] = useState(() => `c${Date.now()}`);
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [base, setBase] = useState<Hub | null>('Lubumbashi');
  const [truckType, setTruckType] = useState<TruckType | null>(null);
  const [truckPlate, setTruckPlate] = useState('');
  const [capacityT, setCapacityT] = useState('30');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+243 ');
  const [docUris, setDocUris] = useState<Partial<Record<DocKey, string>>>({});
  const [busy, setBusy] = useState<DocKey | null>(null);

  const canSubmit = company.trim() && base && truckType && truckPlate.trim() && driverName.trim();

  async function upload(key: DocKey) {
    const local = await pickDocumentImage(t);
    if (!local) return;
    setBusy(key);
    try {
      const uri = await uploadDocumentImage(local, carrierId, key);
      setDocUris((d) => ({ ...d, [key]: uri }));
    } catch {
      Alert.alert(t('uploadFailed'));
    } finally {
      setBusy(null);
    }
  }

  function submit() {
    if (!base || !truckType) return;
    dispatch({
      type: 'registerCarrier',
      input: {
        id: carrierId,
        company: company.trim(),
        phone,
        base,
        truckType,
        truckPlate: truckPlate.trim().toUpperCase(),
        capacityT: Number(capacityT) || 0,
        driverName: driverName.trim(),
        driverPhone,
        docUris,
      },
    });
    Alert.alert(t('fileSubmittedTitle'), t('fileSubmittedMsg'), [{ text: t('ok'), onPress: () => router.back() }]);
  }

  return (
    <Screen inStack title={t('registration')} subtitle={t('registrationSubtitle')}>
      <FormField label={t('companyName')} placeholder={t('companyPlaceholder')} value={company} onChangeText={setCompany} />
      <FormField label={t('phone')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <ChipSelect label={t('operatingBase')} options={HUBS} value={base} onChange={setBase} />
      <SectionHeader title={t('truckSection')} />
      <ChipSelect label={t('truckType')} options={TRUCK_TYPES} value={truckType} onChange={setTruckType} />
      <View style={styles.row}>
        <View style={styles.half}>
          <FormField label={t('plate')} placeholder="HK 0000 AB" autoCapitalize="characters" value={truckPlate} onChangeText={setTruckPlate} />
        </View>
        <View style={styles.half}>
          <FormField label={t('capacity')} keyboardType="number-pad" value={capacityT} onChangeText={setCapacityT} />
        </View>
      </View>
      <SectionHeader title={t('driverSection')} />
      <FormField label={t('driverName')} value={driverName} onChangeText={setDriverName} />
      <FormField label={t('driverPhoneField')} keyboardType="phone-pad" value={driverPhone} onChangeText={setDriverPhone} />
      <SectionHeader title={t('documents')} />
      <Card style={{ gap: 0 }}>
        {DOC_TEMPLATES.map((d) => (
          <DocRow
            key={d.key}
            doc={{ ...d, status: docUris[d.key] ? 'televerse' : 'manquant', uri: docUris[d.key] }}
            busy={busy === d.key}
            actionLabel={docUris[d.key] ? t('replace') : t('upload')}
            onAction={() => upload(d.key)}
          />
        ))}
      </Card>
      <ThemedText type="small" themeColor="textSecondary">{t('submitWithoutDocsHint')}</ThemedText>
      <Button title={t('submitFile')} onPress={submit} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
});
