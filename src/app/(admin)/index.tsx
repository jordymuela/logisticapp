import { Card } from '@/components/card';
import { CarrierCard } from '@/components/carrier-card';
import { LoadCard } from '@/components/load-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/store/app-store';

export default function AdminQueue() {
  const { loads, carriers } = useStore();
  const pendingCarriers = carriers.filter((c) => c.status === 'en_attente');
  const pendingLoads = loads.filter((l) => l.status === 'en_attente');
  const others = carriers.filter((c) => c.status !== 'en_attente');
  const live = loads.filter((l) => l.status === 'valide' || l.status === 'assigne' || l.status === 'en_transit');
  return (
    <Screen title="Revue de conformité" subtitle={`${pendingCarriers.length + pendingLoads.length} élément(s) en attente`}>
      <SectionHeader title="Transporteurs à vérifier" count={pendingCarriers.length} />
      {pendingCarriers.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">Aucun dossier transporteur en attente.</ThemedText>
        </Card>
      ) : (
        pendingCarriers.map((c) => <CarrierCard key={c.id} carrier={c} />)
      )}
      <SectionHeader title="Chargements à valider" count={pendingLoads.length} />
      {pendingLoads.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">Aucun chargement en attente.</ThemedText>
        </Card>
      ) : (
        pendingLoads.map((l) => <LoadCard key={l.id} load={l} showShipper />)
      )}
      <SectionHeader title="Chargements en cours" count={live.length} />
      {live.map((l) => (
        <LoadCard key={l.id} load={l} showShipper />
      ))}
      <SectionHeader title="Transporteurs enregistrés" count={others.length} />
      {others.map((c) => (
        <CarrierCard key={c.id} carrier={c} />
      ))}
    </Screen>
  );
}
