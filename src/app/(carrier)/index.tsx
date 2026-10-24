import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { LoadCard } from '@/components/load-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/strings';
import { useStore } from '@/store/app-store';
import { CARRIER_STATUS_COLOR } from '@/utils/format';

export default function CarrierMissions() {
  const { loads, activeCarrier } = useStore();
  const { t } = useI18n();
  const mine = loads.filter((l) => l.carrierId === activeCarrier.id && (l.status === 'assigne' || l.status === 'en_transit'));
  const available = loads.filter((l) => l.status === 'valide');
  const history = loads.filter((l) => l.carrierId === activeCarrier.id && l.status === 'livre');
  const approved = activeCarrier.status === 'approuve';
  return (
    <Screen title={t('missions')} subtitle={`${activeCarrier.company} · ${activeCarrier.truckPlate}`}>
      {!approved ? (
        <Card>
          <Badge label={t(`carrier_${activeCarrier.status}` as StringKey)} color={CARRIER_STATUS_COLOR[activeCarrier.status]} />
          <ThemedText type="small" themeColor="textSecondary">
            {activeCarrier.status === 'en_attente'
              ? t('pendingBanner')
              : t('rejectedBanner', {
                  note: activeCarrier.note ? ` : ${activeCarrier.note.startsWith('reason') ? t(activeCarrier.note as StringKey) : activeCarrier.note}` : '',
                })}
          </ThemedText>
        </Card>
      ) : null}
      <SectionHeader title={t('myMissions')} count={mine.length} />
      {mine.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">{t('noMissions')}</ThemedText>
        </Card>
      ) : (
        mine.map((l) => <LoadCard key={l.id} load={l} showShipper priceMode="truck" />)
      )}
      <SectionHeader title={t('availableLoads')} count={available.length} />
      {available.length === 0 ? (
        <Card>
          <ThemedText themeColor="textSecondary">{t('noAvailable')}</ThemedText>
        </Card>
      ) : (
        available.map((l) => <LoadCard key={l.id} load={l} showShipper priceMode="truck" />)
      )}
      {history.length ? (
        <>
          <SectionHeader title={t('history')} count={history.length} />
          {history.map((l) => (
            <LoadCard key={l.id} load={l} showShipper priceMode="truck" />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
