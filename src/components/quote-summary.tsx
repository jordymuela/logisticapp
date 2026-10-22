import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatUSD } from '@/utils/format';

interface Props {
  truckPrice: number;
  adminFee: number;
  insurancePremium: number;
  insured: boolean;
}

export function QuoteSummary({ truckPrice, adminFee, insurancePremium, insured }: Props) {
  const theme = useTheme();
  const total = truckPrice + adminFee + insurancePremium;
  return (
    <Card>
      <ThemedText type="smallBold" themeColor="textSecondary" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Devis
      </ThemedText>
      <Row label="Prix camion (transporteur)" value={formatUSD(truckPrice)} />
      <Row label="Supplément de gestion (plateforme)" value={formatUSD(adminFee)} />
      <Row label={insured ? 'Prime d\'assurance (assureur partenaire)' : 'Assurance non souscrite'} value={insured ? formatUSD(insurancePremium) : '—'} />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.row}>
        <ThemedText type="smallBold">Devis total</ThemedText>
        <ThemedText style={styles.total}>{formatUSD(total)}</ThemedText>
      </View>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>{label}</ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  total: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
});
