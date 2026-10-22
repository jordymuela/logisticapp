import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { LoadCard } from '@/components/load-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS } from '@/utils/format';

export default function CarrierMissions() {
  const { loads, activeCarrier } = useStore();
  const mine = loads.filter((l) => l.carrierId === activeCarrier.id && (l.status === 'assigne' || l.status === 'en_transit'));
  const available = loads.filter((l) => l.status === 'valide');
  const history = loads.filter((l) => l.carrierId === activeCarrier.id && l.status === 'livre');
  const approved = activeCarrier.status === 'approuve';
  const status = CARRIER_STATUS[activeCarrier.status];
  return (
    <Screen title="Missions" subtitle={`${activeCarrier.company} · ${activeCarrier.truckPlate}`}>
      {!approved ? (
        <Card>
          <Badge label={status.label} color={status.color} />
          <ThemedText type="small" themeColor="textSecondary">
            {activeCarrier.status === 'en_attente'
              ? 'Votre dossier est en cours de vérification par l\'administrateur. Vous pourrez accepter des missions après approbation.'
              : `Dossier rejeté${activeCarrier.note ? ` : ${activeCarrier.note}` : ''}. Mettez vos documents à jour dans l'onglet Mon camion.`}
          </ThemedText>
        </Card>
      ) : null}
      <SectionHeader title="Mes missions" count={mine.length} />
      {mine.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">Aucune mission en cours.</ThemedText>
        </Card>
      ) : (
        mine.map((l) => <LoadCard key={l.id} load={l} showShipper priceMode="truck" />)
      )}
      <SectionHeader title="Chargements disponibles" count={available.length} />
      {available.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">Aucun chargement validé pour le moment.</ThemedText>
        </Card>
      ) : (
        available.map((l) => <LoadCard key={l.id} load={l} showShipper priceMode="truck" />)
      )}
      {history.length ? (
        <>
          <SectionHeader title="Historique" count={history.length} />
          {history.map((l) => (
            <LoadCard key={l.id} load={l} showShipper priceMode="truck" />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
