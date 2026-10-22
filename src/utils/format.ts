import type { CarrierStatus, DocStatus, LoadStatus } from '@/domain/types';
import type { ThemeColor } from '@/constants/theme';

export function formatUSD(value: number): string {
  return `${Math.round(value).toLocaleString('fr-FR')} USD`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const LOAD_STATUS: Record<LoadStatus, { label: string; color: ThemeColor }> = {
  en_attente: { label: 'En attente', color: 'warning' },
  valide: { label: 'Validé', color: 'info' },
  assigne: { label: 'Assigné', color: 'primary' },
  en_transit: { label: 'En transit', color: 'accent' },
  livre: { label: 'Livré', color: 'success' },
  rejete: { label: 'Rejeté', color: 'danger' },
};

export const CARRIER_STATUS: Record<CarrierStatus, { label: string; color: ThemeColor }> = {
  en_attente: { label: 'En attente d\'approbation', color: 'warning' },
  approuve: { label: 'Approuvé', color: 'success' },
  rejete: { label: 'Rejeté', color: 'danger' },
};

export const DOC_STATUS: Record<DocStatus, { label: string; color: ThemeColor }> = {
  manquant: { label: 'Manquant', color: 'danger' },
  televerse: { label: 'Téléversé', color: 'warning' },
  verifie: { label: 'Vérifié', color: 'success' },
  rejete: { label: 'Rejeté', color: 'danger' },
};

export const LOAD_STEPS: { status: LoadStatus; label: string; hint: string }[] = [
  { status: 'en_attente', label: 'Déclaré', hint: 'Revue de conformité par l\'admin' },
  { status: 'valide', label: 'Validé', hint: 'Publié aux transporteurs approuvés' },
  { status: 'assigne', label: 'Camion assigné', hint: 'Transporteur et chauffeur confirmés' },
  { status: 'en_transit', label: 'En transit', hint: 'Suivi du trajet' },
  { status: 'livre', label: 'Livré', hint: 'Paiements déclenchés' },
];
