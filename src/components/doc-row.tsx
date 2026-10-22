import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/badge';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { Doc } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { DOC_STATUS, formatDate } from '@/utils/format';

interface Props {
  doc: Doc;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function DocRow({ doc, actionLabel, onAction, secondaryLabel, onSecondary }: Props) {
  const theme = useTheme();
  const status = DOC_STATUS[doc.status];
  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
        {doc.uri ? <Image source={{ uri: doc.uri }} style={styles.thumbImg} contentFit="cover" /> : null}
      </View>
      <View style={styles.body}>
        <ThemedText type="smallBold">{doc.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {doc.owner === 'camion' ? 'Camion' : 'Chauffeur'}
          {doc.expiry ? ` · expire ${formatDate(doc.expiry)}` : ''}
        </ThemedText>
        <Badge label={status.label} color={status.color} />
      </View>
      <View style={styles.actions}>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="info">{actionLabel}</ThemedText>
          </Pressable>
        ) : null}
        {secondaryLabel && onSecondary ? (
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
  actions: { alignItems: 'flex-end', gap: 6 },
});
