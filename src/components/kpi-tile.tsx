import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function KpiTile({ label, value, color = 'primary' }: { label: string; value: string; color?: ThemeColor }) {
  const theme = useTheme();
  return (
    <Card style={styles.tile}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <View style={[styles.bar, { backgroundColor: theme[color] }]} />
      <ThemedText style={styles.value}>{value}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 140, gap: 6 },
  bar: { height: 3, width: 28, borderRadius: 2 },
  value: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
