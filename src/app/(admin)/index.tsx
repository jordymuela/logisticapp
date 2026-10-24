import { Card } from '@/components/card';
import { CarrierCard } from '@/components/carrier-card';
import { LoadCard } from '@/components/load-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';
import { useStore } from '@/store/app-store';

export default function AdminQueue() {
  const { loads, carriers } = useStore();
  const { t } = useI18n();
  const pendingCarriers = carriers.filter((c) => c.status === 'en_attente');
  const pendingLoads = loads.filter((l) => l.status === 'en_attente');
  const others = carriers.filter((c) => c.status !== 'en_attente');
  const live = loads.filter((l) => l.status === 'valide' || l.status === 'assigne' || l.status === 'en_transit');
  return (
    <Screen title={t('complianceReview')} subtitle={t('pendingItems', { n: pendingCarriers.length + pendingLoads.length })}>
      <SectionHeader title={t('carriersToVerify')} count={pendingCarriers.length} />
      {pendingCarriers.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">{t('noPendingCarriers')}</ThemedText>
        </Card>
      ) : (
        pendingCarriers.map((c) => <CarrierCard key={c.id} carrier={c} />)
      )}
      <SectionHeader title={t('loadsToValidate')} count={pendingLoads.length} />
      {pendingLoads.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">{t('noPendingLoads')}</ThemedText>
        </Card>
      ) : (
        pendingLoads.map((l) => <LoadCard key={l.id} load={l} showShipper />)
      )}
      <SectionHeader title={t('loadsInProgress')} count={live.length} />
      {live.map((l) => (
        <LoadCard key={l.id} load={l} showShipper />
      ))}
      <SectionHeader title={t('registeredCarriers')} count={others.length} />
      {others.map((c) => (
        <CarrierCard key={c.id} carrier={c} />
      ))}
    </Screen>
  );
}
