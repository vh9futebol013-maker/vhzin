export type MenuCategory = 'Smash' | 'Artesanais' | 'Combos' | 'Bebidas';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
  highlight?: string;
  prepMinutes?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'novo' | 'preparando' | 'entrega' | 'entregue';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';
export type PaymentStatus = 'pendente' | 'pago';

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  isPickup?: boolean;
}

export interface OrderReceipt {
  transactionId: string;
  paidAt: string;
  methodLabel: string;
  pixKeyUsed?: string;
  changeFor?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receipt?: OrderReceipt;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  openHourLabel: string;
  weekendHourLabel: string;
  isOpen: boolean;
  fixedDeliveryFee: number;
  minOrderValue: number;
  pixKey: string;
  estimatedMinutes: string;
}

export type AppRoute = 'storefront' | 'admin';
export type AdminTab = 'pedidos' | 'cardapio' | 'configuracoes';
