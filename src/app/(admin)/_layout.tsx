import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n';

export default function AdminTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { t } = useI18n();
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabReview')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.seal.fill" md="verified" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dashboard">
        <NativeTabs.Trigger.Label>{t('tabDashboard')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
