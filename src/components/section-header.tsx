import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.row}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.title}>
        {title}
      </ThemedText>
      {count !== undefined ? <ThemedText type="smallBold" themeColor="textSecondary">{count}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two },
  title: { textTransform: 'uppercase', letterSpacing: 0.6 },
});
