import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { Lang } from '@/i18n/strings';

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'fr', label: 'FR' },
  { lang: 'pt', label: 'PT' },
];

export function LangToggle() {
  const theme = useTheme();
  const { lang, setLang } = useI18n();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.backgroundSelected }]}>
      {OPTIONS.map((o) => {
        const active = o.lang === lang;
        return (
          <Pressable
            key={o.lang}
            onPress={() => setLang(o.lang)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.pill, active && { backgroundColor: theme.primary }]}>
            <Text style={[styles.label, { color: active ? theme.onPrimary : theme.textSecondary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: Radius.pill, padding: 3, alignSelf: 'flex-start' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  label: { fontSize: 13, fontWeight: '700' },
});
