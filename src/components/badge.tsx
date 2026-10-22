import { StyleSheet, Text, View } from 'react-native';

import { Radius, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Badge({ label, color }: { label: string; color: ThemeColor }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: `${theme[color]}22`, borderColor: `${theme[color]}55` }]}>
      <Text style={[styles.text, { color: theme[color] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
