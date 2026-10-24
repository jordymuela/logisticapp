import { Card } from '@/components/card';
import { LoadCard } from '@/components/load-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';
import { useStore } from '@/store/app-store';

export default function ShipperLoads() {
  const { loads, shipper } = useStore();
  const { t } = useI18n();
  const mine = loads.filter((l) => l.shipperName === shipper.company);
  const active = mine.filter((l) => l.status !== 'livre' && l.status !== 'rejete');
  const done = mine.filter((l) => l.status === 'livre' || l.status === 'rejete');
  return (
    <Screen title={t('myLoads')} subtitle={shipper.company}>
      <SectionHeader title={t('inProgress')} count={active.length} />
      {active.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">{t('noActiveLoads')}</ThemedText>
        </Card>
      ) : (
        active.map((l) => <LoadCard key={l.id} load={l} />)
      )}
      {done.length ? (
        <>
          <SectionHeader title={t('finished')} count={done.length} />
          {done.map((l) => (
            <LoadCard key={l.id} load={l} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
