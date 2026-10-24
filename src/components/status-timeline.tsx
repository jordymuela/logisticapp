import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Load, TimelineEvent } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useI18n, type Translate } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { LOAD_STEPS, formatDateTime } from '@/utils/format';

export function eventLabel(e: TimelineEvent, t: Translate): string {
  if (e.key === 'rejected') {
    const reason = e.detail?.startsWith('reason') ? t(e.detail as StringKey) : (e.detail ?? '');
    return t('event_rejected', { reason });
  }
  return t(`event_${e.key}` as StringKey);
}

export function StatusTimeline({ load }: { load: Load }) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const currentIdx = LOAD_STEPS.indexOf(load.status);
  const rejected = load.status === 'rejete';
  const rejectEvent = load.events.find((e) => e.key === 'rejected');

  return (
    <View>
      {LOAD_STEPS.map((step, i) => {
        const done = !rejected && i < currentIdx;
        const current = !rejected && i === currentIdx;
        const event = load.events[i];
        const dotColor = done ? theme.success : current ? theme.accent : theme.border;
        const last = i === LOAD_STEPS.length - 1;
        return (
          <View key={step} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor, borderColor: dotColor }, current && styles.dotCurrent]} />
              {!last ? <View style={[styles.line, { backgroundColor: done ? theme.success : theme.border }]} /> : null}
            </View>
            <View style={styles.body}>
              <ThemedText type={current ? 'smallBold' : 'small'} themeColor={done || current ? 'text' : 'textSecondary'}>
                {t(`step_${step}` as StringKey)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {(done || current) && event ? formatDateTime(event.at, lang) : t(`stepHint_${step}` as StringKey)}
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
            <ThemedText type="smallBold" themeColor="danger">{t('status_rejete')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {rejectEvent ? eventLabel(rejectEvent, t) : t('seeReason')}
            </ThemedText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, minHeight: 52 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginTop: 3 },
  dotCurrent: { width: 16, height: 16, borderRadius: 8, marginTop: 2 },
  line: { flex: 1, width: 2, marginVertical: 2 },
  body: { flex: 1, paddingBottom: Spacing.two },
});
