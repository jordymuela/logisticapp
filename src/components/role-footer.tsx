import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/store/app-store';

export function RoleFooter() {
  const { dispatch } = useStore();
  return (
    <View style={styles.wrap}>
      <Button
        title="Changer de rôle"
        variant="ghost"
        onPress={() => {
          dispatch({ type: 'setRole', role: null });
          router.replace('/');
        }}
      />
      <Button
        title="Réinitialiser la démo"
        variant="ghost"
        onPress={() =>
          Alert.alert('Réinitialiser', 'Les données de démonstration seront restaurées.', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réinitialiser', style: 'destructive', onPress: () => dispatch({ type: 'reset' }) },
          ])
        }
      />
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Démo · données fictives · aucun paiement réel
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two, marginTop: Spacing.three },
  note: { textAlign: 'center' },
});
