import type { Carrier, Load } from '@/domain/types';
import { supabase } from '@/services/supabase';

type LoadRow = {
  id: string;
  reference: string;
  shipper_name: string;
  origin: string;
  destination: string;
  cargo_type: string;
  description: string;
  weight_t: number;
  volume_m3: number;
  estimated_value: number;
  insured: boolean;
  deadline: string | null;
  truck_price: number;
  admin_fee: number;
  insurance_premium: number;
  status: Load['status'];
  carrier_id: string | null;
  events: Load['events'];
  note: string | null;
  created_at: string;
};

type CarrierRow = {
  id: string;
  company: string;
  phone: string;
  base: string;
  truck_plate: string;
  truck_type: string;
  capacity_t: number;
  driver_name: string;
  driver_phone: string;
  status: Carrier['status'];
  docs: Carrier['docs'];
  note: string | null;
  registered_at: string;
};

function loadToRow(l: Load): LoadRow {
  return {
    id: l.id,
    reference: l.reference,
    shipper_name: l.shipperName,
    origin: l.origin,
    destination: l.destination,
    cargo_type: l.cargoType,
    description: l.description,
    weight_t: l.weightT,
    volume_m3: l.volumeM3,
    estimated_value: l.estimatedValue,
    insured: l.insured,
    deadline: l.deadline || null,
    truck_price: l.truckPrice,
    admin_fee: l.adminFee,
    insurance_premium: l.insurancePremium,
    status: l.status,
    carrier_id: l.carrierId ?? null,
    events: l.events,
    note: l.note ?? null,
    created_at: l.createdAt,
  };
}

function rowToLoad(r: LoadRow): Load {
  return {
    id: r.id,
    reference: r.reference,
    shipperName: r.shipper_name,
    origin: r.origin as Load['origin'],
    destination: r.destination as Load['destination'],
    cargoType: r.cargo_type as Load['cargoType'],
    description: r.description,
    weightT: Number(r.weight_t),
    volumeM3: Number(r.volume_m3),
    estimatedValue: Number(r.estimated_value),
    insured: r.insured,
    deadline: r.deadline ?? '',
    truckPrice: Number(r.truck_price),
    adminFee: Number(r.admin_fee),
    insurancePremium: Number(r.insurance_premium),
    status: r.status,
    carrierId: r.carrier_id ?? undefined,
    events: r.events ?? [],
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}

function carrierToRow(c: Carrier): CarrierRow {
  return {
    id: c.id,
    company: c.company,
    phone: c.phone,
    base: c.base,
    truck_plate: c.truckPlate,
    truck_type: c.truckType,
    capacity_t: c.capacityT,
    driver_name: c.driverName,
    driver_phone: c.driverPhone,
    status: c.status,
    docs: c.docs,
    note: c.note ?? null,
    registered_at: c.registeredAt,
  };
}

function rowToCarrier(r: CarrierRow): Carrier {
  return {
    id: r.id,
    company: r.company,
    phone: r.phone,
    base: r.base as Carrier['base'],
    truckPlate: r.truck_plate,
    truckType: r.truck_type as Carrier['truckType'],
    capacityT: Number(r.capacity_t),
    driverName: r.driver_name,
    driverPhone: r.driver_phone,
    status: r.status,
    docs: r.docs ?? [],
    note: r.note ?? undefined,
    registeredAt: r.registered_at,
  };
}

export async function fetchAll(): Promise<{ loads: Load[]; carriers: Carrier[] } | null> {
  if (!supabase) return null;
  const [loads, carriers] = await Promise.all([
    supabase.from('loads').select('*').order('created_at', { ascending: false }),
    supabase.from('carriers').select('*').order('registered_at', { ascending: false }),
  ]);
  if (loads.error) throw loads.error;
  if (carriers.error) throw carriers.error;
  return {
    loads: (loads.data as LoadRow[]).map(rowToLoad),
    carriers: (carriers.data as CarrierRow[]).map(rowToCarrier),
  };
}

export async function upsertLoads(loads: Load[]): Promise<void> {
  if (!supabase || loads.length === 0) return;
  const { error } = await supabase.from('loads').upsert(loads.map(loadToRow));
  if (error) throw error;
}

export async function upsertCarriers(carriers: Carrier[]): Promise<void> {
  if (!supabase || carriers.length === 0) return;
  const { error } = await supabase.from('carriers').upsert(carriers.map(carrierToRow));
  if (error) throw error;
}

/** Wipes both tables and reinserts the given data (demo reset / first seed). */
export async function replaceAll(loads: Load[], carriers: Carrier[]): Promise<void> {
  if (!supabase) return;
  const del1 = await supabase.from('loads').delete().neq('id', '');
  if (del1.error) throw del1.error;
  const del2 = await supabase.from('carriers').delete().neq('id', '');
  if (del2.error) throw del2.error;
  await upsertCarriers(carriers);
  await upsertLoads(loads);
}

export interface RemoteChange {
  table: 'loads' | 'carriers';
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  load?: Load;
  carrier?: Carrier;
  deletedId?: string;
}

/** Subscribes to realtime changes on both tables. Returns an unsubscribe function. */
export function subscribe(onChange: (change: RemoteChange) => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('corridor-demo')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, (payload) => {
      if (payload.eventType === 'DELETE') {
        onChange({ table: 'loads', type: 'DELETE', deletedId: (payload.old as { id: string }).id });
      } else {
        onChange({ table: 'loads', type: payload.eventType, load: rowToLoad(payload.new as LoadRow) });
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'carriers' }, (payload) => {
      if (payload.eventType === 'DELETE') {
        onChange({ table: 'carriers', type: 'DELETE', deletedId: (payload.old as { id: string }).id });
      } else {
        onChange({ table: 'carriers', type: payload.eventType, carrier: rowToCarrier(payload.new as CarrierRow) });
      }
    })
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
