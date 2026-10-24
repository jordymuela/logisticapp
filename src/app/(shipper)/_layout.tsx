import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n';

export default function ShipperTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { t } = useI18n();
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabLoads')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="shippingbox.fill" md="inventory_2" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-load">
        <NativeTabs.Trigger.Label>{t('tabDeclare')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{t('tabCompany')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="building.2.fill" md="business" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
