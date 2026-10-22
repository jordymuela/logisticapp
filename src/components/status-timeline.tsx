import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Load } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { LOAD_STEPS, formatDateTime } from '@/utils/format';

export function StatusTimeline({ load }: { load: Load }) {
  const theme = useTheme();
  const currentIdx = LOAD_STEPS.findIndex((s) => s.status === load.status);
  const rejected = load.status === 'rejete';

  return (
    <View style={styles.wrap}>
      {LOAD_STEPS.map((step, i) => {
        const done = !rejected && i < currentIdx;
        const current = !rejected && i === currentIdx;
        const event = load.events[i];
        const dotColor = done ? theme.success : current ? theme.accent : theme.border;
        const last = i === LOAD_STEPS.length - 1;
        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor, borderColor: dotColor }, current && styles.dotCurrent]} />
              {!last ? <View style={[styles.line, { backgroundColor: done ? theme.success : theme.border }]} /> : null}
            </View>
            <View style={styles.body}>
              <ThemedText type={current ? 'smallBold' : 'small'} themeColor={done || current ? 'text' : 'textSecondary'}>
                {step.label}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {done || current ? (event ? formatDateTime(event.at) : step.hint) : step.hint}
              </ThemedText>
            </View>
          </View>
        );
      })}
      {rejected ? (
        <View style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.dot, { backgroundColor: theme.danger, borderColor: theme.danger }]} />
          </View>
          <View style={styles.body}>
            <ThemedText type="smallBold" themeColor="danger">Rejeté</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{load.note ?? 'Voir motif'}</ThemedText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: 'row', gap: Spacing.three, minHeight: 52 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginTop: 3 },
  dotCurrent: { width: 16, height: 16, borderRadius: 8, marginTop: 2 },
  line: { flex: 1, width: 2, marginVertical: 2 },
  body: { flex: 1, paddingBottom: Spacing.two },
});
