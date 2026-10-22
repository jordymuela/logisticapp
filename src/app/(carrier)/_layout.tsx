import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CarrierTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Missions</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="truck.box.fill" md="local_shipping" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fleet">
        <NativeTabs.Trigger.Label>Mon camion</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text.fill" md="description" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
