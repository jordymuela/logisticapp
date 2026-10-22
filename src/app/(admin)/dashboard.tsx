import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { KpiTile } from '@/components/kpi-tile';
import { RoleFooter } from '@/components/role-footer';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ADMIN_FEE_USD, yearlyProjection } from '@/domain/pricing';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/app-store';
import { formatUSD } from '@/utils/format';

export default function Dashboard() {
  const theme = useTheme();
  const { loads, carriers } = useStore();
  const billed = loads.filter((l) => l.status !== 'en_attente' && l.status !== 'rejete');
  const fees = billed.reduce((s, l) => s + l.adminFee, 0);
  const premiums = billed.reduce((s, l) => s + l.insurancePremium, 0);
  const transport = billed.reduce((s, l) => s + l.truckPrice, 0);
  const active = loads.filter((l) => l.status === 'valide' || l.status === 'assigne' || l.status === 'en_transit').length;
  const delivered = loads.filter((l) => l.status === 'livre').length;
  const approved = carriers.filter((c) => c.status === 'approuve').length;
  const pending = carriers.filter((c) => c.status === 'en_attente').length + loads.filter((l) => l.status === 'en_attente').length;

  return (
    <Screen title="Tableau de bord" subtitle="Plateforme Corridor RDC">
      <View style={styles.tiles}>
        <KpiTile label="Chargements actifs" value={String(active)} color="info" />
        <KpiTile label="Livrés" value={String(delivered)} color="success" />
        <KpiTile label="Transporteurs approuvés" value={String(approved)} />
        <KpiTile label="En attente de revue" value={String(pending)} color="warning" />
      </View>
      <SectionHeader title="Flux financiers (démo)" />
      <Card>
        <Row label="Suppléments de gestion (plateforme)" value={formatUSD(fees)} strong />
        <Row label="Primes d'assurance (assureur partenaire)" value={formatUSD(premiums)} />
        <Row label="Paiements transport (propriétaires de camions)" value={formatUSD(transport)} />
        <ThemedText type="small" themeColor="textSecondary">
          Supplément fixe de {ADMIN_FEE_USD} USD par chargement validé. Le transport et la prime transitent directement entre les parties.
        </ThemedText>
      </Card>
      <SectionHeader title="Projection de revenus annuels" />
      <View style={styles.tiles}>
        {[300, 500].map((n, i) => (
          <Card key={n} style={[styles.scenario, { borderColor: i === 0 ? theme.info : theme.accent }]}>
            <ThemedText type="smallBold" themeColor={i === 0 ? 'info' : 'accent'}>Scénario {i + 1}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{n} chargements / mois</ThemedText>
            <ThemedText style={styles.big}>{formatUSD(yearlyProjection(n))}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">par an</ThemedText>
          </Card>
        ))}
      </View>
      <SectionHeader title="Corridors couverts" />
      <Card>
        <ThemedText type="small">Banana / Boma / Matadi → Kinshasa</ThemedText>
        <ThemedText type="small">Kinshasa → Lubumbashi → Kolwezi</ThemedText>
        <ThemedText type="small">Kolwezi / Lubumbashi → Kasumbalesa (Zambie)</ThemedText>
        <ThemedText type="small">Dundo (Angola) → Kasaï → Kinshasa</ThemedText>
      </Card>
      <RoleFooter />
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>{label}</ThemedText>
      <ThemedText type={strong ? 'smallBold' : 'small'}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  scenario: { flex: 1, minWidth: 150, borderWidth: 1.5 },
  big: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
});
