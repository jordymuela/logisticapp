import type { ThemeColor } from '@/constants/theme';
import type { CarrierStatus, DocStatus, LoadStatus } from '@/domain/types';
import { LOCALE } from '@/i18n';
import type { Lang } from '@/i18n/strings';

export function formatUSD(value: number, lang: Lang = 'fr'): string {
  return `${Math.round(value).toLocaleString(LOCALE[lang])} USD`;
}

export function formatDate(iso: string, lang: Lang = 'fr'): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' });
}

export function formatDateTime(iso: string, lang: Lang = 'fr'): string {
  return new Date(iso).toLocaleString(LOCALE[lang], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const LOAD_STATUS_COLOR: Record<LoadStatus, ThemeColor> = {
  en_attente: 'warning',
  valide: 'info',
  assigne: 'primary',
  en_transit: 'accent',
  livre: 'success',
  rejete: 'danger',
};

export const CARRIER_STATUS_COLOR: Record<CarrierStatus, ThemeColor> = {
  en_attente: 'warning',
  approuve: 'success',
  rejete: 'danger',
};

export const DOC_STATUS_COLOR: Record<DocStatus, ThemeColor> = {
  manquant: 'danger',
  televerse: 'warning',
  verifie: 'success',
  rejete: 'danger',
};

export const LOAD_STEPS: LoadStatus[] = ['en_attente', 'valide', 'assigne', 'en_transit', 'livre'];
