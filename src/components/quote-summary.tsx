import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatUSD } from '@/utils/format';

interface Props {
  truckPrice: number;
  adminFee: number;
  insurancePremium: number;
  insured: boolean;
}

export function QuoteSummary({ truckPrice, adminFee, insurancePremium, insured }: Props) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const total = truckPrice + adminFee + insurancePremium;
  return (
    <Card>
      <ThemedText type="smallBold" themeColor="textSecondary" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {t('quote')}
      </ThemedText>
      <Row label={t('truckPriceRow')} value={formatUSD(truckPrice, lang)} />
      <Row label={t('adminFeeRow')} value={formatUSD(adminFee, lang)} />
      <Row label={insured ? t('premiumRow') : t('noInsuranceRow')} value={insured ? formatUSD(insurancePremium, lang) : '—'} />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.row}>
        <ThemedText type="smallBold">{t('quoteTotal')}</ThemedText>
        <ThemedText style={styles.total}>{formatUSD(total, lang)}</ThemedText>
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
