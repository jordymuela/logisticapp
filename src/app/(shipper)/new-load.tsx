import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Button } from '@/components/button';
import { ChipSelect } from '@/components/chip-select';
import { FormField } from '@/components/form-field';
import { QuoteSummary } from '@/components/quote-summary';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ADMIN_FEE_USD, distanceKm, estimateTruckPrice, insurancePremium } from '@/domain/pricing';
import { CARGO_TYPES, HUBS, type CargoType, type Hub } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { useStore } from '@/store/app-store';

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function NewLoad() {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const { dispatch } = useStore();
  const [origin, setOrigin] = useState<Hub | null>('Matadi');
  const [destination, setDestination] = useState<Hub | null>(null);
  const [cargoType, setCargoType] = useState<CargoType | null>('Conteneur');
  const [description, setDescription] = useState('');
  const [weightT, setWeightT] = useState('24');
  const [volumeM3, setVolumeM3] = useState('60');
  const [estimatedValue, setEstimatedValue] = useState('50000');
  const [insured, setInsured] = useState(true);
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [truckPrice, setTruckPrice] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);

  const weight = Number(weightT) || 0;
  const value = Number(estimatedValue) || 0;
  const km = origin && destination ? distanceKm(origin, destination) : 0;
  const estimated = origin && destination && origin !== destination ? estimateTruckPrice(origin, destination, weight) : 0;
  const price = priceTouched ? Number(truckPrice) || 0 : estimated;
  const premium = insurancePremium(value, insured);
  const canSubmit = origin && destination && origin !== destination && cargoType && description.trim() && weight > 0 && price > 0;

  function submit() {
    if (!origin || !destination || !cargoType) return;
    const id = `l${Date.now()}`;
    dispatch({
      type: 'addLoad',
      id,
      input: {
        origin,
        destination,
        cargoType,
        description: description.trim(),
        weightT: weight,
        volumeM3: Number(volumeM3) || 0,
        estimatedValue: value,
        insured,
        deadline,
        truckPrice: price,
      },
    });
    setDescription('');
    setDestination(null);
    setPriceTouched(false);
    Alert.alert(t('loadDeclaredTitle'), t('loadDeclaredMsg'), [{ text: t('viewLoad'), onPress: () => router.push(`/load/${id}`) }]);
  }

  return (
    <Screen title={t('declareLoad')} subtitle={t('quoteAuto')}>
      <ChipSelect label={t('loadingPlace')} options={HUBS} value={origin} onChange={setOrigin} />
      <ChipSelect label={t('unloadingPlace')} options={HUBS} value={destination} onChange={setDestination} />
      {km ? (
        <ThemedText type="small" themeColor="textSecondary">{t('distanceHint', { km: km.toLocaleString(lang === 'pt' ? 'pt-PT' : 'fr-FR') })}</ThemedText>
      ) : null}
      <ChipSelect label={t('cargoType')} options={CARGO_TYPES} value={cargoType} onChange={setCargoType} />
      <FormField label={t('description')} placeholder={t('descPlaceholder')} value={description} onChangeText={setDescription} />
      <View style={styles.row}>
        <View style={styles.half}>
          <FormField label={t('weight')} keyboardType="decimal-pad" value={weightT} onChangeText={setWeightT} />
        </View>
        <View style={styles.half}>
          <FormField label={t('volume')} keyboardType="decimal-pad" value={volumeM3} onChangeText={setVolumeM3} />
        </View>
      </View>
      <FormField label={t('declaredValue')} keyboardType="number-pad" value={estimatedValue} onChangeText={setEstimatedValue} />
      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold">{t('insureCargo')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{t('insureHint')}</ThemedText>
        </View>
        <Switch value={insured} onValueChange={setInsured} trackColor={{ true: theme.success }} />
      </View>
      <FormField label={t('deadline')} placeholder="AAAA-MM-JJ" value={deadline} onChangeText={setDeadline} />
      <FormField
        label={t('truckPriceProposed')}
        hint={t('truckPriceHint')}
        keyboardType="number-pad"
        value={priceTouched ? truckPrice : String(price || '')}
        onChangeText={(v) => {
          setPriceTouched(true);
          setTruckPrice(v);
        }}
      />
      <QuoteSummary truckPrice={price} adminFee={ADMIN_FEE_USD} insurancePremium={premium} insured={insured} />
      <Button title={t('submitForValidation')} onPress={submit} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: 14, borderWidth: 1 },
});
