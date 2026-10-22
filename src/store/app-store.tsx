import { createContext, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';

import { ADMIN_FEE_USD, insurancePremium } from '@/domain/pricing';
import { DEMO_SHIPPER, SEED_CARRIERS, SEED_LOADS } from '@/domain/seed';
import { DOC_TEMPLATES, type Carrier, type Doc, type DocKey, type Load, type Role, type Shipper } from '@/domain/types';

interface State {
  role: Role | null;
  shipper: Shipper;
  activeCarrierId: string;
  carriers: Carrier[];
  loads: Load[];
  seq: number;
}

export type NewLoadInput = Omit<
  Load,
  'id' | 'reference' | 'adminFee' | 'insurancePremium' | 'status' | 'events' | 'createdAt' | 'shipperName'
>;

export type NewCarrierInput = Omit<Carrier, 'id' | 'status' | 'docs' | 'registeredAt'> & {
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
  | { type: 'reset' };

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
        events: [{ at: now(), label: 'Chargement déclaré par l\'expéditeur' }],
        createdAt: now(),
      };
      return { ...state, loads: [load, ...state.loads], seq: state.seq + 1 };
    }
    case 'validateLoad':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'valide',
        events: [...l.events, { at: now(), label: 'Validé par l\'administrateur' }],
      }));
    case 'rejectLoad':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'rejete',
        note: action.reason,
        events: [...l.events, { at: now(), label: `Rejeté : ${action.reason}` }],
      }));
    case 'acceptMission':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'assigne',
        carrierId: action.carrierId,
        events: [...l.events, { at: now(), label: 'Mission acceptée par le transporteur' }],
      }));
    case 'startTransit':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'en_transit',
        events: [...l.events, { at: now(), label: 'Camion en route' }],
      }));
    case 'confirmDelivery':
      return patchLoad(state, action.id, (l) => ({
        ...l,
        status: 'livre',
        events: [...l.events, { at: now(), label: 'Livraison confirmée' }],
      }));
    case 'registerCarrier': {
      const { docUris, ...rest } = action.input;
      const id = `c${Date.now()}`;
      const carrier: Carrier = {
        ...rest,
        id,
        status: 'en_attente',
        registeredAt: now(),
        docs: DOC_TEMPLATES.map((t) => {
          const uri = docUris[t.key];
          return { ...t, status: uri ? 'televerse' : 'manquant', uri };
        }),
      };
      return { ...state, carriers: [carrier, ...state.carriers], activeCarrierId: id };
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
        docs: c.docs.map((d) => (d.status === 'televerse' ? { ...d, status: 'verifie' } : d)),
      }));
    case 'rejectCarrier':
      return patchCarrier(state, action.id, (c) => ({ ...c, status: 'rejete', note: action.reason }));
    case 'reset':
      return { ...initialState, role: state.role };
    default:
      return state;
  }
}

interface Store extends State {
  dispatch: React.Dispatch<Action>;
  activeCarrier: Carrier;
  carrierById: (id?: string) => Carrier | undefined;
  loadById: (id?: string) => Load | undefined;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo<Store>(() => {
    const carrierById = (id?: string) => state.carriers.find((c) => c.id === id);
    return {
      ...state,
      dispatch,
      activeCarrier: carrierById(state.activeCarrierId) ?? state.carriers[0],
      carrierById,
      loadById: (id?: string) => state.loads.find((l) => l.id === id),
    };
  }, [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
