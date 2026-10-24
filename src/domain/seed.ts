import { ADMIN_FEE_USD, estimateTruckPrice, insurancePremium } from '@/domain/pricing';
import { DOC_TEMPLATES, type Carrier, type Doc, type DocStatus, type Load, type Shipper } from '@/domain/types';

export const DEMO_SHIPPER: Shipper = {
  company: 'TransOrnelas',
  fiscalNumber: 'RCCM/KIN/2026/B-04471',
  email: 'ops@transornelas.com',
  phone: '+243 81 000 00 00',
  address: 'Avenue du Port, Matadi',
  cargoType: 'Conteneur',
};

function daysAgo(n: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function docs(status: DocStatus, overrides: Partial<Record<Doc['key'], DocStatus>> = {}): Doc[] {
  return DOC_TEMPLATES.map((t) => ({
    ...t,
    status: overrides[t.key] ?? status,
    expiry: t.key === 'assurance' ? inDays(140) : t.key === 'permis' ? inDays(600) : undefined,
  }));
}

export const SEED_CARRIERS: Carrier[] = [
  {
    id: 'c1',
    company: 'Transports Kalonji',
    phone: '+243 99 123 45 67',
    base: 'Lubumbashi',
    truckPlate: 'HK 4521 AB',
    truckType: 'Porte-conteneur 40\'',
    capacityT: 30,
    driverName: 'Patrick Mwamba',
    driverPhone: '+243 97 555 12 12',
    status: 'approuve',
    docs: docs('verifie'),
    registeredAt: daysAgo(40),
  },
  {
    id: 'c2',
    company: 'Ets Mbuyi Logistique',
    phone: '+243 81 222 33 44',
    base: 'Kinshasa',
    truckType: 'Benne 30T',
    truckPlate: 'KN 7730 CD',
    capacityT: 30,
    driverName: 'Jean-Claude Ilunga',
    driverPhone: '+243 82 101 20 30',
    status: 'en_attente',
    docs: docs('televerse', { dgm: 'manquant' }),
    registeredAt: daysAgo(2),
  },
  {
    id: 'c3',
    company: 'Katanga Haulage SARL',
    phone: '+243 97 800 90 10',
    base: 'Kolwezi',
    truckPlate: 'KW 1188 EF',
    truckType: 'Plateau 25T',
    capacityT: 25,
    driverName: 'Didier Kasongo',
    driverPhone: '+243 99 333 44 55',
    status: 'approuve',
    docs: docs('verifie'),
    registeredAt: daysAgo(25),
  },
  {
    id: 'c4',
    company: 'Lualaba Express',
    phone: '+243 85 444 55 66',
    base: 'Kasumbalesa',
    truckPlate: 'KS 0921 GH',
    truckType: 'Citerne 35 000 L',
    capacityT: 32,
    driverName: 'Moïse Tshibanda',
    driverPhone: '+243 84 777 88 99',
    status: 'en_attente',
    docs: docs('televerse'),
    registeredAt: daysAgo(1),
  },
];

interface LoadInput {
  id: string;
  n: number;
  shipperName: string;
  origin: Load['origin'];
  destination: Load['destination'];
  cargoType: Load['cargoType'];
  description: string;
  weightT: number;
  volumeM3: number;
  estimatedValue: number;
  insured: boolean;
  deadlineInDays: number;
  status: Load['status'];
  carrierId?: string;
  ageDays: number;
}

function makeLoad(i: LoadInput): Load {
  const truckPrice = estimateTruckPrice(i.origin, i.destination, i.weightT);
  const events: Load['events'] = [{ at: daysAgo(i.ageDays), key: 'declared' }];
  const order: Load['status'][] = ['en_attente', 'valide', 'assigne', 'en_transit', 'livre'];
  const idx = order.indexOf(i.status);
  if (idx >= 1) events.push({ at: daysAgo(i.ageDays - 1, 11), key: 'validated' });
  if (idx >= 2) events.push({ at: daysAgo(i.ageDays - 1, 15), key: 'accepted' });
  if (idx >= 3) events.push({ at: daysAgo(i.ageDays - 2, 6), key: 'enroute' });
  if (idx >= 4) events.push({ at: daysAgo(0, 14), key: 'delivered' });
  if (i.status === 'rejete') events.push({ at: daysAgo(i.ageDays - 1, 10), key: 'rejected', detail: 'reasonValueInconsistent' });
  return {
    id: i.id,
    reference: `LOAD-2026-${String(i.n).padStart(4, '0')}`,
    shipperName: i.shipperName,
    origin: i.origin,
    destination: i.destination,
    cargoType: i.cargoType,
    description: i.description,
    weightT: i.weightT,
    volumeM3: i.volumeM3,
    estimatedValue: i.estimatedValue,
    insured: i.insured,
    deadline: inDays(i.deadlineInDays),
    truckPrice,
    adminFee: ADMIN_FEE_USD,
    insurancePremium: insurancePremium(i.estimatedValue, i.insured),
    status: i.status,
    carrierId: i.carrierId,
    events,
    createdAt: daysAgo(i.ageDays),
  };
}

export const SEED_LOADS: Load[] = [
  makeLoad({
    id: 'l1', n: 1, shipperName: 'TransOrnelas', origin: 'Matadi', destination: 'Kinshasa',
    cargoType: 'Conteneur', description: '2 x 40\' MSC, pièces détachées', weightT: 24, volumeM3: 67,
    estimatedValue: 85000, insured: true, deadlineInDays: 6, status: 'en_attente', ageDays: 0,
  }),
  makeLoad({
    id: 'l2', n: 2, shipperName: 'TransOrnelas', origin: 'Matadi', destination: 'Lubumbashi',
    cargoType: 'Industrielle', description: 'Équipement minier (broyeur)', weightT: 28, volumeM3: 40,
    estimatedValue: 150000, insured: true, deadlineInDays: 20, status: 'valide', ageDays: 3,
  }),
  makeLoad({
    id: 'l3', n: 3, shipperName: 'Congo Minerals SARL', origin: 'Kolwezi', destination: 'Kasumbalesa',
    cargoType: 'Minérale', description: 'Cathodes de cuivre, 30 t', weightT: 30, volumeM3: 12,
    estimatedValue: 270000, insured: true, deadlineInDays: 4, status: 'en_transit', carrierId: 'c3', ageDays: 4,
  }),
  makeLoad({
    id: 'l4', n: 4, shipperName: 'Agro Kasaï', origin: 'Kinshasa', destination: 'Lubumbashi',
    cargoType: 'Agricole', description: 'Maïs en sacs de 50 kg', weightT: 22, volumeM3: 55,
    estimatedValue: 18000, insured: false, deadlineInDays: 15, status: 'assigne', carrierId: 'c1', ageDays: 2,
  }),
  makeLoad({
    id: 'l5', n: 5, shipperName: 'TransOrnelas', origin: 'Boma', destination: 'Kinshasa',
    cargoType: 'Conteneur', description: '1 x 40\' MEDU, électroménager', weightT: 18, volumeM3: 60,
    estimatedValue: 42000, insured: true, deadlineInDays: -3, status: 'livre', carrierId: 'c1', ageDays: 9,
  }),
  makeLoad({
    id: 'l6', n: 6, shipperName: 'Petro Katanga', origin: 'Kasumbalesa', destination: 'Kolwezi',
    cargoType: 'Industrielle', description: 'Carburant diesel, 35 000 L', weightT: 30, volumeM3: 35,
    estimatedValue: 60000, insured: true, deadlineInDays: 5, status: 'valide', ageDays: 1,
  }),
  makeLoad({
    id: 'l7', n: 7, shipperName: 'Agro Kasaï', origin: 'Dundo', destination: 'Kinshasa',
    cargoType: 'Agricole', description: 'Huile de palme, fûts', weightT: 20, volumeM3: 30,
    estimatedValue: 9000, insured: false, deadlineInDays: 10, status: 'rejete', ageDays: 5,
  }),
];
