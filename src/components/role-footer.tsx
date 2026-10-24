import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { LangToggle } from '@/components/lang-toggle';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useStore } from '@/store/app-store';

export function RoleFooter() {
  const { dispatch, syncStatus } = useStore();
  const { t } = useI18n();
  return (
    <View style={styles.wrap}>
      <View style={styles.langRow}>
        <ThemedText type="smallBold" themeColor="textSecondary">{t('language')}</ThemedText>
        <LangToggle />
      </View>
      <Button
        title={t('changeRole')}
        variant="ghost"
        onPress={() => {
          dispatch({ type: 'setRole', role: null });
          router.replace('/');
        }}
      />
      <Button
        title={t('resetDemo')}
        variant="ghost"
        onPress={() =>
          Alert.alert(t('resetTitle'), t('resetMsg'), [
            { text: t('cancel'), style: 'cancel' },
            { text: t('resetTitle'), style: 'destructive', onPress: () => dispatch({ type: 'reset' }) },
          ])
        }
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {t('demoNote')}
      </ThemedText>
      <ThemedText type="small" themeColor={syncStatus === 'error' ? 'danger' : 'textSecondary'} style={styles.note}>
        {syncStatus === 'live' || syncStatus === 'loading' ? t('cloudConnected') : t('cloudOffline')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two, marginTop: Spacing.three },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  note: { textAlign: 'center' },
});
