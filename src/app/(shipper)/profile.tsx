import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { KpiTile } from '@/components/kpi-tile';
import { RoleFooter } from '@/components/role-footer';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { quoteTotal } from '@/domain/pricing';
import { useStore } from '@/store/app-store';
import { formatUSD } from '@/utils/format';

export default function ShipperProfile() {
  const { shipper, loads } = useStore();
  const mine = loads.filter((l) => l.shipperName === shipper.company);
  const delivered = mine.filter((l) => l.status === 'livre');
  const spent = delivered.reduce((s, l) => s + quoteTotal(l), 0);
  return (
    <Screen title={shipper.company} subtitle="Compte expéditeur">
      <View style={styles.tiles}>
        <KpiTile label="Chargements" value={String(mine.length)} />
        <KpiTile label="Livrés" value={String(delivered.length)} color="success" />
        <KpiTile label="Dépensé" value={formatUSD(spent)} color="accent" />
      </View>
      <SectionHeader title="Informations de l'entreprise" />
      <Card>
        <Row label="Numéro fiscal / RCCM" value={shipper.fiscalNumber} />
        <Row label="E-mail" value={shipper.email} />
        <Row label="Téléphone" value={shipper.phone} />
        <Row label="Adresse" value={shipper.address} />
        <Row label="Cargaison principale" value={shipper.cargoType} />
      </Card>
      <RoleFooter />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="small" style={{ flexShrink: 1, textAlign: 'right' }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three, paddingVertical: 4 },
});
