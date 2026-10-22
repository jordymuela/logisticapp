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
import { useStore } from '@/store/app-store';
import { pickDocumentImage } from '@/utils/pick-document';

export default function RegisterTruck() {
  const { dispatch } = useStore();
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [base, setBase] = useState<Hub | null>('Lubumbashi');
  const [truckType, setTruckType] = useState<TruckType | null>(null);
  const [truckPlate, setTruckPlate] = useState('');
  const [capacityT, setCapacityT] = useState('30');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+243 ');
  const [docUris, setDocUris] = useState<Partial<Record<DocKey, string>>>({});

  const canSubmit = company.trim() && base && truckType && truckPlate.trim() && driverName.trim();

  async function upload(key: DocKey) {
    const uri = await pickDocumentImage();
    if (uri) setDocUris((d) => ({ ...d, [key]: uri }));
  }

  function submit() {
    if (!base || !truckType) return;
    dispatch({
      type: 'registerCarrier',
      input: {
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
    Alert.alert('Dossier soumis', 'Votre dossier est transmis à l\'administrateur pour vérification des documents.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <Screen inStack title="Inscription" subtitle="Propriétaire de camion et chauffeur">
      <FormField label="Nom de l'entreprise" placeholder="ex. Transports Kalonji" value={company} onChangeText={setCompany} />
      <FormField label="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <ChipSelect label="Base d'opération" options={HUBS} value={base} onChange={setBase} />
      <SectionHeader title="Camion" />
      <ChipSelect label="Type de camion" options={TRUCK_TYPES} value={truckType} onChange={setTruckType} />
      <View style={styles.row}>
        <View style={styles.half}>
          <FormField label="Immatriculation" placeholder="HK 0000 AB" autoCapitalize="characters" value={truckPlate} onChangeText={setTruckPlate} />
        </View>
        <View style={styles.half}>
          <FormField label="Capacité (t)" keyboardType="number-pad" value={capacityT} onChangeText={setCapacityT} />
        </View>
      </View>
      <SectionHeader title="Chauffeur" />
      <FormField label="Nom du chauffeur" value={driverName} onChangeText={setDriverName} />
      <FormField label="Téléphone du chauffeur" keyboardType="phone-pad" value={driverPhone} onChangeText={setDriverPhone} />
      <SectionHeader title="Documents" />
      <Card style={{ gap: 0 }}>
        {DOC_TEMPLATES.map((t) => (
          <DocRow
            key={t.key}
            doc={{ ...t, status: docUris[t.key] ? 'televerse' : 'manquant', uri: docUris[t.key] }}
            actionLabel={docUris[t.key] ? 'Remplacer' : 'Téléverser'}
            onAction={() => upload(t.key)}
          />
        ))}
      </Card>
      <ThemedText type="small" themeColor="textSecondary">
        Vous pouvez soumettre sans tous les documents : le dossier restera en attente jusqu’à ce qu’ils soient fournis et vérifiés.
      </ThemedText>
      <Button title="Soumettre le dossier" onPress={submit} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
});
