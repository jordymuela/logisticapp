import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** true when rendered inside a stack with a native header (no top safe area needed). */
  inStack?: boolean;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export function Screen({ title, subtitle, right, inStack, children, contentStyle }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={inStack ? ['bottom'] : ['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.five }, contentStyle]}>
        {title ? (
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">{title}</ThemedText>
              {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
});
