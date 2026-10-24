import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { Doc } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { DOC_STATUS_COLOR, formatDate } from '@/utils/format';

interface Props {
  doc: Doc;
  busy?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function DocRow({ doc, busy, actionLabel, onAction, secondaryLabel, onSecondary }: Props) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
        {doc.uri ? <Image source={{ uri: doc.uri }} style={styles.thumbImg} contentFit="cover" /> : null}
      </View>
      <View style={styles.body}>
        <ThemedText type="smallBold">{t(`docLabel_${doc.key}` as StringKey)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t(`docOwner_${doc.owner}` as StringKey)}
          {doc.expiry ? ` · ${t('expires', { date: formatDate(doc.expiry, lang) })}` : ''}
        </ThemedText>
        <Badge label={t(`doc_${doc.status}` as StringKey)} color={DOC_STATUS_COLOR[doc.status]} />
      </View>
      <View style={styles.actions}>
        {busy ? <ActivityIndicator /> : null}
        {!busy && actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="info">{actionLabel}</ThemedText>
          </Pressable>
        ) : null}
        {!busy && secondaryLabel && onSecondary ? (
          <Pressable onPress={onSecondary} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="danger">{secondaryLabel}</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  thumb: { width: 48, height: 48, borderRadius: Radius.sm, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  body: { flex: 1, gap: 4 },
  actions: { alignItems: 'flex-end', gap: 6, minWidth: 64 },
});
