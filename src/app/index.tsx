import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { LangToggle } from '@/components/lang-toggle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Role } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { useStore } from '@/store/app-store';

const ROLES: { role: Role; title: StringKey; who: string | StringKey; desc: StringKey; route: '/(shipper)' | '/(carrier)' | '/(admin)' }[] = [
  { role: 'shipper', title: 'roleShipper', who: 'TransOrnelas', desc: 'roleShipperDesc', route: '/(shipper)' },
  { role: 'carrier', title: 'roleCarrier', who: 'Transports Kalonji', desc: 'roleCarrierDesc', route: '/(carrier)' },
  { role: 'admin', title: 'roleAdmin', who: 'roleAdminWho', desc: 'roleAdminDesc', route: '/(admin)' },
];

export default function RolePicker() {
  const theme = useTheme();
  const { t } = useI18n();
  const { dispatch, syncStatus } = useStore();
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <LangToggle />
      </View>
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <ThemedText style={[styles.logoText, { color: theme.onPrimary }]}>C</ThemedText>
        </View>
        <ThemedText type="subtitle">{t('appName')}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.tagline}>
          {t('tagline')}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
        {t('iAm')}
      </ThemedText>
      {ROLES.map((r) => (
        <Card
          key={r.role}
          onPress={() => {
            dispatch({ type: 'setRole', role: r.role });
            router.replace(r.route);
          }}>
          <ThemedText style={styles.roleTitle}>{t(r.title)}</ThemedText>
          <ThemedText type="smallBold" themeColor="accent">
            {r.who === 'roleAdminWho' ? t('roleAdminWho') : r.who}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{t(r.desc)}</ThemedText>
        </Card>
      ))}
      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        {t('demoFooter')}
      </ThemedText>
      <ThemedText type="small" themeColor={syncStatus === 'error' ? 'danger' : 'textSecondary'} style={styles.footer}>
        {syncStatus === 'live' || syncStatus === 'loading' ? t('cloudConnected') : t('cloudOffline')}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.two },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
  hero: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 34, fontWeight: '800', lineHeight: 40 },
  tagline: { textAlign: 'center', paddingHorizontal: Spacing.three },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
  roleTitle: { fontSize: 18, fontWeight: '700' },
  footer: { textAlign: 'center', marginTop: Spacing.one },
});
