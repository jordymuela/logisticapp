import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type PropsWithChildren } from 'react';

import { ADMIN_FEE_USD, insurancePremium } from '@/domain/pricing';
import { DEMO_SHIPPER, SEED_CARRIERS, SEED_LOADS } from '@/domain/seed';
import { DOC_TEMPLATES, type Carrier, type Doc, type DocKey, type Load, type Role, type Shipper } from '@/domain/types';
import { fetchAll, replaceAll, subscribe, upsertCarriers, upsertLoads, type RemoteChange } from '@/services/repository';
import { isCloudEnabled } from '@/services/supabase';

interface State {
  role: Role | null;
  shipper: Shipper;
  activeCarrierId: string;
  carriers: Carrier[];
  loads: Load[];
  seq: number;
}

export type SyncStatus = 'local' | 'loading' | 'live' | 'error';

export type NewLoadInput = Omit<
  Load,
  'id' | 'reference' | 'adminFee' | 'insurancePremium' | 'status' | 'events' | 'createdAt' | 'shipperName'
>;

export type NewCarrierInput = Omit<Carrier, 'id' | 'status' | 'docs' | 'registeredAt'> & {
  id: string;
  docUris: Partial<Record<DocKey, string>>;
};

type Action =
  | { type: 'setRole'; role: Role | null }
  | { type: 'addLoad'; id: string; input: NewLoadInput }
  | { type: 'validateLoad'; id: string }
  | { type: 'rejectLoad'; id: string; reason: string }
  | { type: 'acceptMission'; id: string; carrierId: string }
  | { type: 'startTransit'; id: string }
  | { type: 'confirmDelivery'; id: string }
  | { type: 'registerCarrier'; input: NewCarrierInput }
  | { type: 'setCarrierDoc'; carrierId: string; key: DocKey; uri: string }
  | { type: 'reviewDoc'; carrierId: string; key: DocKey; status: Doc['status'] }
  | { type: 'approveCarrier'; id: string }
  | { type: 'rejectCarrier'; id: string; reason: string }
  | { type: 'reset' }
  | { type: 'hydrate'; loads: Load[]; carriers: Carrier[] }
  | { type: 'remote'; change: RemoteChange };

const initialState: State = {
  role: null,
  shipper: DEMO_SHIPPER,
  activeCarrierId: 'c1',
  carriers: SEED_CARRIERS,
  loads: SEED_LOADS,
  seq: SEED_LOADS.length + 1,
};

const now = () => new Date().toISOString();

function patchLoad(state: State, id: string, fn: (l: Load) => Load): State {
  return { ...state, loads: state.loads.map((l) => (l.id === id ? fn(l) : l)) };
}

function patchCarrier(state: State, id: string, fn: (c: Carrier) => Carrier): State {
  return { ...state, carriers: state.carriers.map((c) => (c.id === id ? fn(c) : c)) };
}

function nextSeq(loads: Load[]): number {
  const max = loads.reduce((m, l) => Math.max(m, Number(l.reference.split('-').pop()) || 0), 0);
  return max + 1;
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role };
    case 'addLoad': {
      const load: Load = {
        ...action.input,
        id: action.id,
        reference: `LOAD-2026-${String(state.seq).padStart(4, '0')}`,
        shipperName: state.shipper.company,
        adminFee: ADMIN_FEE_USD,
        insurancePremium: insurancePremium(action.input.estimatedValue, action.input.insured),
        status: 'en_attente',
        events: [{ at: now(), key: 'declared' }],
        createdAt: now(),
      };
      return { ...state, loads: [load, ...state.loads], seq: state.seq + 1 };
    }
    case 'validateLoad':
      return patchLoad(state, action.id, (l) => ({ ...l, status: 'valide', events: [...l.events, { at: now(), key: 'validated' }] }));
    case 'rejectLoad':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'rejete',
        note: action.reason,
        events: [...l.events, { at: now(), key: 'rejected', detail: action.reason }],
      }));
    case 'acceptMission':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'assigne',
        carrierId: action.carrierId,
        events: [...l.events, { at: now(), key: 'accepted' }],
      }));
    case 'startTransit':
      return patchLoad(state, action.id, (l) => ({ ...l, status: 'en_transit', events: [...l.events, { at: now(), key: 'enroute' }] }));
    case 'confirmDelivery':
      return patchLoad(state, action.id, (l) => ({ ...l, status: 'livre', events: [...l.events, { at: now(), key: 'delivered' }] }));
    case 'registerCarrier': {
      const { docUris, ...rest } = action.input;
      const carrier: Carrier = {
        ...rest,
        status: 'en_attente',
        registeredAt: now(),
        docs: DOC_TEMPLATES.map((t) => {
          const uri = docUris[t.key];
          return { ...t, status: uri ? 'televerse' : 'manquant', uri };
        }),
      };
      return { ...state, carriers: [carrier, ...state.carriers], activeCarrierId: carrier.id };
    }
    case 'setCarrierDoc':
      return patchCarrier(state, action.carrierId, (c) => ({
        ...c,
        docs: c.docs.map((d) => (d.key === action.key ? { ...d, uri: action.uri, status: 'televerse' } : d)),
      }));
    case 'reviewDoc':
      return patchCarrier(state, action.carrierId, (c) => ({
        ...c,
        docs: c.docs.map((d) => (d.key === action.key ? { ...d, status: action.status } : d)),
      }));
    case 'approveCarrier':
      return patchCarrier(state, action.id, (c) => ({
        ...c,
        status: 'approuve',
        note: undefined,
        docs: c.docs.map((d) => (d.status === 'televerse' ? { ...d, status: 'verifie' } : d)),
      }));
    case 'rejectCarrier':
      return patchCarrier(state, action.id, (c) => ({ ...c, status: 'rejete', note: action.reason }));
    case 'reset':
      return { ...initialState, role: state.role };
    case 'hydrate':
      return {
        ...state,
        loads: action.loads,
        carriers: action.carriers,
        seq: nextSeq(action.loads),
        activeCarrierId: action.carriers.some((c) => c.id === state.activeCarrierId) ? state.activeCarrierId : (action.carriers[0]?.id ?? state.activeCarrierId),
      };
    case 'remote': {
      const { change } = action;
      if (change.table === 'loads') {
        if (change.type === 'DELETE') return { ...state, loads: state.loads.filter((l) => l.id !== change.deletedId) };
        if (change.load) {
          const loads = upsertById(state.loads, change.load);
          return { ...state, loads, seq: Math.max(state.seq, nextSeq(loads)) };
        }
      } else {
        if (change.type === 'DELETE') return { ...state, carriers: state.carriers.filter((c) => c.id !== change.deletedId) };
        if (change.carrier) return { ...state, carriers: upsertById(state.carriers, change.carrier) };
      }
      return state;
    }
    default:
      return state;
  }
}

/** Persists whatever changed between two states (compared by object identity). */
async function persistDiff(before: State, after: State): Promise<void> {
  const changedLoads = after.loads.filter((l) => !before.loads.includes(l));
  const changedCarriers = after.carriers.filter((c) => !before.carriers.includes(c));
  await upsertCarriers(changedCarriers);
  await upsertLoads(changedLoads);
}

interface Store extends State {
  dispatch: (action: Action) => void;
  syncStatus: SyncStatus;
  activeCarrier: Carrier;
  carrierById: (id?: string) => Carrier | undefined;
  loadById: (id?: string) => Load | undefined;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isCloudEnabled ? 'loading' : 'local');
  // Mirrors the latest state so dispatch can diff before/after without waiting for a render.
  const stateRef = useRef(state);

  const dispatch = useCallback((action: Action) => {
    const before = stateRef.current;
    const after = reducer(before, action);
    stateRef.current = after;
    rawDispatch(action);
    if (!isCloudEnabled || action.type === 'hydrate' || action.type === 'remote' || action.type === 'setRole') return;
    const work = action.type === 'reset' ? replaceAll(after.loads, after.carriers) : persistDiff(before, after);
    work.catch((e) => {
      console.warn('Supabase sync failed', e);
      setSyncStatus('error');
    });
  }, []);

  useEffect(() => {
    if (!isCloudEnabled) return;
    let cancelled = false;
    fetchAll()
      .then(async (data) => {
        if (cancelled || !data) return;
        if (data.loads.length === 0 && data.carriers.length === 0) {
          await replaceAll(SEED_LOADS, SEED_CARRIERS);
          dispatch({ type: 'hydrate', loads: SEED_LOADS, carriers: SEED_CARRIERS });
        } else {
          dispatch({ type: 'hydrate', loads: data.loads, carriers: data.carriers });
        }
        setSyncStatus('live');
      })
      .catch((e) => {
        console.warn('Supabase fetch failed, using local data', e);
        if (!cancelled) setSyncStatus('error');
      });
    const unsubscribe = subscribe((change) => dispatch({ type: 'remote', change }));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [dispatch]);

  const value = useMemo<Store>(() => {
    const carrierById = (id?: string) => state.carriers.find((c) => c.id === id);
    return {
      ...state,
      dispatch,
      syncStatus,
      activeCarrier: carrierById(state.activeCarrierId) ?? state.carriers[0] ?? SEED_CARRIERS[0],
      carrierById,
      loadById: (id?: string) => state.loads.find((l) => l.id === id),
    };
  }, [state, dispatch, syncStatus]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
