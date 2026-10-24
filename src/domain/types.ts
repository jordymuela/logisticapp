export type Role = 'shipper' | 'carrier' | 'admin';

export const HUBS = [
  'Matadi',
  'Boma',
  'Banana',
  'Kinshasa',
  'Lubumbashi',
  'Kolwezi',
  'Kasumbalesa',
  'Goma',
  'Dundo',
] as const;
export type Hub = (typeof HUBS)[number];

export const CARGO_TYPES = ['Minérale', 'Agricole', 'Industrielle', 'Conteneur', 'Autre'] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const TRUCK_TYPES = ['Porte-conteneur 40\'', 'Benne 30T', 'Plateau 25T', 'Citerne 35 000 L', 'Frigorifique 20T'] as const;
export type TruckType = (typeof TRUCK_TYPES)[number];

export type LoadStatus = 'en_attente' | 'valide' | 'assigne' | 'en_transit' | 'livre' | 'rejete';

export type DocKey = 'afegeme' | 'carte_rose' | 'assurance' | 'dgm' | 'permis';
export type DocOwner = 'camion' | 'chauffeur';
export type DocStatus = 'manquant' | 'televerse' | 'verifie' | 'rejete';

export interface Doc {
  key: DocKey;
  owner: DocOwner;
  status: DocStatus;
  expiry?: string;
  uri?: string;
}

export type CarrierStatus = 'en_attente' | 'approuve' | 'rejete';

export interface Carrier {
  id: string;
  company: string;
  phone: string;
  base: Hub;
  truckPlate: string;
  truckType: TruckType;
  capacityT: number;
  driverName: string;
  driverPhone: string;
  status: CarrierStatus;
  docs: Doc[];
  registeredAt: string;
  note?: string;
}

export type EventKey = 'declared' | 'validated' | 'accepted' | 'enroute' | 'delivered' | 'rejected';

export interface TimelineEvent {
  at: string;
  key: EventKey;
  /** Free text attached to the event, e.g. a rejection reason. */
  detail?: string;
}

export interface Load {
  id: string;
  reference: string;
  shipperName: string;
  origin: Hub;
  destination: Hub;
  cargoType: CargoType;
  description: string;
  weightT: number;
  volumeM3: number;
  estimatedValue: number;
  insured: boolean;
  deadline: string;
  truckPrice: number;
  adminFee: number;
  insurancePremium: number;
  status: LoadStatus;
  carrierId?: string;
  events: TimelineEvent[];
  createdAt: string;
  note?: string;
}

export interface Shipper {
  company: string;
  fiscalNumber: string;
  email: string;
  phone: string;
  address: string;
  cargoType: CargoType;
}

export const DOC_TEMPLATES: Omit<Doc, 'status' | 'uri' | 'expiry'>[] = [
  { key: 'afegeme', owner: 'camion' },
  { key: 'carte_rose', owner: 'camion' },
  { key: 'assurance', owner: 'camion' },
  { key: 'dgm', owner: 'chauffeur' },
  { key: 'permis', owner: 'chauffeur' },
];
