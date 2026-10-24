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
import { useI18n } from '@/i18n';
import { useStore } from '@/store/app-store';
import { formatUSD } from '@/utils/format';

export default function Dashboard() {
  const theme = useTheme();
  const { t, lang } = useI18n();
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
    <Screen title={t('dashboard')} subtitle={t('platform')}>
      <View style={styles.tiles}>
        <KpiTile label={t('activeLoads')} value={String(active)} color="info" />
        <KpiTile label={t('delivered')} value={String(delivered)} color="success" />
        <KpiTile label={t('approvedCarriers')} value={String(approved)} />
        <KpiTile label={t('pendingReview')} value={String(pending)} color="warning" />
      </View>
      <SectionHeader title={t('financialFlows')} />
      <Card>
        <Row label={t('feesRow')} value={formatUSD(fees, lang)} strong />
        <Row label={t('premiumsRow')} value={formatUSD(premiums, lang)} />
        <Row label={t('transportRow')} value={formatUSD(transport, lang)} />
        <ThemedText type="small" themeColor="textSecondary">{t('feeNote', { fee: ADMIN_FEE_USD })}</ThemedText>
      </Card>
      <SectionHeader title={t('projection')} />
      <View style={styles.tiles}>
        {[300, 500].map((n, i) => (
          <Card key={n} style={[styles.scenario, { borderColor: i === 0 ? theme.info : theme.accent }]}>
            <ThemedText type="smallBold" themeColor={i === 0 ? 'info' : 'accent'}>{t('scenario', { n: i + 1 })}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{t('loadsPerMonth', { n })}</ThemedText>
            <ThemedText style={styles.big}>{formatUSD(yearlyProjection(n), lang)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{t('perYear')}</ThemedText>
          </Card>
        ))}
      </View>
      <SectionHeader title={t('corridors')} />
      <Card>
        <ThemedText type="small">Banana / Boma / Matadi → Kinshasa</ThemedText>
        <ThemedText type="small">Kinshasa → Lubumbashi → Kolwezi</ThemedText>
        <ThemedText type="small">Kolwezi / Lubumbashi → Kasumbalesa</ThemedText>
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
