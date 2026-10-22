import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Role } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/app-store';

const ROLES: { role: Role; title: string; who: string; desc: string; route: '/(shipper)' | '/(carrier)' | '/(admin)' }[] = [
  {
    role: 'shipper',
    title: 'Expéditeur',
    who: 'TransOrnelas',
    desc: 'Déclarer un chargement, obtenir un devis, suivre la livraison.',
    route: '/(shipper)',
  },
  {
    role: 'carrier',
    title: 'Transporteur',
    who: 'Transports Kalonji',
    desc: 'Inscrire camion et chauffeur, téléverser les documents, accepter des missions.',
    route: '/(carrier)',
  },
  {
    role: 'admin',
    title: 'Administrateur plateforme',
    who: 'Revue de conformité',
    desc: 'Vérifier AFEGEME, DGM et assurance, valider les chargements, suivre les revenus.',
    route: '/(admin)',
  },
];

export default function RolePicker() {
  const theme = useTheme();
  const { dispatch } = useStore();
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <ThemedText style={[styles.logoText, { color: theme.onPrimary }]}>C</ThemedText>
        </View>
        <ThemedText type="subtitle">Corridor RDC</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.tagline}>
          Chargements vérifiés, camions conformes, de Matadi à Kasumbalesa.
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
        Je suis…
      </ThemedText>
      {ROLES.map((r) => (
        <Card
          key={r.role}
          onPress={() => {
            dispatch({ type: 'setRole', role: r.role });
            router.replace(r.route);
          }}>
          <ThemedText style={styles.roleTitle}>{r.title}</ThemedText>
          <ThemedText type="smallBold" themeColor="accent">{r.who}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{r.desc}</ThemedText>
        </Card>
      ))}
      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        Prototype de démonstration · données fictives
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.five },
  hero: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 34, fontWeight: '800', lineHeight: 40 },
  tagline: { textAlign: 'center', paddingHorizontal: Spacing.three },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
  roleTitle: { fontSize: 18, fontWeight: '700' },
  footer: { textAlign: 'center', marginTop: Spacing.three },
});
