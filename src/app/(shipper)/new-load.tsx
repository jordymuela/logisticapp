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
import { useStore } from '@/store/app-store';

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function NewLoad() {
  const theme = useTheme();
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
    Alert.alert('Chargement déclaré', 'Votre chargement est envoyé à l\'administrateur pour validation.', [
      { text: 'Voir le chargement', onPress: () => router.push(`/load/${id}`) },
    ]);
  }

  return (
    <Screen title="Déclarer un chargement" subtitle="Le devis se calcule automatiquement">
      <ChipSelect label="Lieu de chargement" options={HUBS} value={origin} onChange={setOrigin} />
      <ChipSelect label="Lieu de déchargement" options={HUBS} value={destination} onChange={setDestination} />
      {km ? (
        <ThemedText type="small" themeColor="textSecondary">Distance indicative : {km.toLocaleString('fr-FR')} km</ThemedText>
      ) : null}
      <ChipSelect label="Type de cargaison" options={CARGO_TYPES} value={cargoType} onChange={setCargoType} />
      <FormField label="Description" placeholder="ex. 2 x 40' MSC, pièces détachées" value={description} onChangeText={setDescription} />
      <View style={styles.row}>
        <View style={styles.half}>
          <FormField label="Poids (t)" keyboardType="decimal-pad" value={weightT} onChangeText={setWeightT} />
        </View>
        <View style={styles.half}>
          <FormField label="Volume (m³)" keyboardType="decimal-pad" value={volumeM3} onChangeText={setVolumeM3} />
        </View>
      </View>
      <FormField label="Valeur déclarée (USD)" keyboardType="number-pad" value={estimatedValue} onChangeText={setEstimatedValue} />
      <View style={[styles.switchRow, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold">Assurer la cargaison</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Prime de 0,8 % de la valeur déclarée via l’assureur partenaire</ThemedText>
        </View>
        <Switch value={insured} onValueChange={setInsured} trackColor={{ true: theme.success }} />
      </View>
      <FormField label="Date limite de livraison" placeholder="AAAA-MM-JJ" value={deadline} onChangeText={setDeadline} />
      <FormField
        label="Prix camion proposé (USD)"
        hint="Estimation automatique, modifiable"
        keyboardType="number-pad"
        value={priceTouched ? truckPrice : String(price || '')}
        onChangeText={(t) => {
          setPriceTouched(true);
          setTruckPrice(t);
        }}
      />
      <QuoteSummary truckPrice={price} adminFee={ADMIN_FEE_USD} insurancePremium={premium} insured={insured} />
      <Button title="Soumettre pour validation" onPress={submit} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: 14, borderWidth: 1 },
});
