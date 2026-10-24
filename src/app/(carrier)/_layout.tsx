import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n';

export default function CarrierTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { t } = useI18n();
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabMissions')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="truck.box.fill" md="local_shipping" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fleet">
        <NativeTabs.Trigger.Label>{t('tabMyTruck')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text.fill" md="description" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
