import { INITIAL_MENU, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/menuData';
import { Order, OrderStatus, PaymentStatus, Product, StoreSettings } from '../types';

/**
 * Camada de Serviços / Persistência Simulada (LocalStorage + Estado Reativo).
 *
 * COMO CONECTAR AO FIREBASE OU SUPABASE NO FUTURO:
 * - Substitua o conteúdo de `fetchOrders()` por uma query no Firestore (`getDocs(collection(db, 'orders'))`)
 *   ou Supabase (`supabase.from('orders').select('*').order('created_at', { ascending: false })`).
 * - Substitua `submitOrder()` por `addDoc(...)` / `supabase.from('orders').insert(...)`.
 * - Substitua `updateOrderStatus()` por `updateDoc(...)` / `supabase.from('orders').update({ status })`.
 */

const STORAGE_KEYS = {
  ORDERS: 'quero_burgers_orders_v1',
  MENU: 'quero_burgers_menu_v1',
  SETTINGS: 'quero_burgers_settings_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in sandboxed iframes
  }
}

export async function fetchOrders(): Promise<Order[]> {
  // Ponto de integração Firebase / Supabase:
  // const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  const stored = safeRead<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return stored;
}

export interface SubmitOrderInput {
  customerName: string;
  customerPhone: string;
  address: Order['address'];
  items: Order['items'];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: Order['paymentMethod'];
  paymentStatus: PaymentStatus;
  changeFor?: number;
  pixKeyUsed?: string;
}

export async function submitOrder(input: SubmitOrderInput): Promise<Order> {
  // Simula latência curta de rede antes de gravar no banco
  await new Promise((resolve) => setTimeout(resolve, 350));

  const currentOrders = safeRead<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const nextNumber = 1049 + currentOrders.length;
  const orderNumber = `QB-${nextNumber}`;
  const nowIso = new Date().toISOString();

  const methodLabel =
    input.paymentMethod === 'pix'
      ? 'Pix Online Instantâneo'
      : input.paymentMethod === 'cartao'
        ? 'Cartão na Entrega'
        : 'Dinheiro na Entrega';

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: nowIso,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    address: input.address,
    items: input.items,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: 'novo',
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    receipt: {
      transactionId:
        input.paymentMethod === 'pix'
          ? `E18236120${Date.now().toString().slice(-10)}${orderNumber.replace('-', '')}`
          : `${input.paymentMethod.toUpperCase()}-${orderNumber.replace('-', '')}`,
      paidAt: nowIso,
      methodLabel,
      pixKeyUsed: input.pixKeyUsed,
      changeFor: input.changeFor,
    },
  };

  // Ponto de integração Firebase / Supabase:
  // await setDoc(doc(db, 'orders', newOrder.id), newOrder);
  const updated = [newOrder, ...currentOrders];
  safeWrite(STORAGE_KEYS.ORDERS, updated);
  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order[]> {
  const currentOrders = safeRead<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = currentOrders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  safeWrite(STORAGE_KEYS.ORDERS, updated);
  return updated;
}

export async function confirmOrderPayment(orderId: string): Promise<Order[]> {
  const currentOrders = safeRead<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = currentOrders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          paymentStatus: 'pago' as PaymentStatus,
          receipt: order.receipt
            ? { ...order.receipt, paidAt: new Date().toISOString() }
            : undefined,
        }
      : order,
  );
  safeWrite(STORAGE_KEYS.ORDERS, updated);
  return updated;
}

export async function fetchMenu(): Promise<Product[]> {
  return safeRead<Product[]>(STORAGE_KEYS.MENU, INITIAL_MENU);
}

export async function saveMenuProducts(products: Product[]): Promise<Product[]> {
  safeWrite(STORAGE_KEYS.MENU, products);
  return products;
}

export async function fetchSettings(): Promise<StoreSettings> {
  return safeRead<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  safeWrite(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}
