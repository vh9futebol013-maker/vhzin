import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_MENU, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/menuData';
import {
  confirmOrderPayment,
  fetchMenu,
  fetchOrders,
  fetchSettings,
  saveMenuProducts,
  saveStoreSettings,
  submitOrder,
  SubmitOrderInput,
  updateOrderStatus,
} from '../services/orderService';
import {
  AppRoute,
  CartItem,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
} from '../types';

interface StoreContextValue {
  route: AppRoute;
  isAdminUnlocked: boolean;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  navigateTo: (route: AppRoute) => void;
  menu: Product[];
  orders: Order[];
  settings: StoreSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
  activeCustomerOrderId: string | null;
  setActiveCustomerOrderId: (id: string | null) => void;
  addToCart: (product: Product, notes?: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (input: SubmitOrderInput) => Promise<Order>;
  changeOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<void>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  updateProductPrice: (productId: string, price: number) => Promise<void>;
  addMenuProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateSettings: (next: StoreSettings) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>('storefront');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [menu, setMenu] = useState<Product[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [loadedMenu, loadedOrders, loadedSettings] = await Promise.all([
        fetchMenu(),
        fetchOrders(),
        fetchSettings(),
      ]);
      setMenu(loadedMenu);
      setOrders(loadedOrders);
      setSettings(loadedSettings);
    })();
  }, []);

  const navigateTo = useCallback(
    (nextRoute: AppRoute) => {
      if (nextRoute === 'admin' && !isAdminUnlocked) {
        return;
      }
      setRoute(nextRoute);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [isAdminUnlocked],
  );

  const unlockAdmin = useCallback(() => {
    setIsAdminUnlocked(true);
    setRoute('admin');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
    setRoute('storefront');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const addToCart = useCallback((product: Product, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, notes: notes ?? item.notes }
            : item,
        );
      }
      return [...prev, { product, quantity: 1, notes }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const placeOrder = useCallback(async (input: SubmitOrderInput) => {
    const created = await submitOrder(input);
    setOrders((prev) => [created, ...prev]);
    setActiveCustomerOrderId(created.id);
    setCart([]);
    return created;
  }, []);

  const changeOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const updated = await updateOrderStatus(orderId, status);
    setOrders(updated);
  }, []);

  const markOrderPaid = useCallback(async (orderId: string) => {
    const updated = await confirmOrderPayment(orderId);
    setOrders(updated);
  }, []);

  const refreshOrders = useCallback(async () => {
    const updated = await fetchOrders();
    setOrders(updated);
  }, []);

  const toggleProductAvailability = useCallback(
    async (productId: string) => {
      const next = menu.map((item) =>
        item.id === productId ? { ...item, available: !item.available } : item,
      );
      setMenu(next);
      await saveMenuProducts(next);
    },
    [menu],
  );

  const updateProductPrice = useCallback(
    async (productId: string, price: number) => {
      const next = menu.map((item) =>
        item.id === productId ? { ...item, price } : item,
      );
      setMenu(next);
      await saveMenuProducts(next);
    },
    [menu],
  );

  const addMenuProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      const newProduct: Product = {
        ...product,
        id: `qb-${Date.now()}`,
      };
      const next = [newProduct, ...menu];
      setMenu(next);
      await saveMenuProducts(next);
    },
    [menu],
  );

  const updateSettings = useCallback(async (next: StoreSettings) => {
    setSettings(next);
    await saveStoreSettings(next);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  );

  const value: StoreContextValue = {
    route,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    navigateTo,
    menu,
    orders,
    settings,
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    isTrackerOpen,
    setIsTrackerOpen,
    activeCustomerOrderId,
    setActiveCustomerOrderId,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    changeOrderStatus,
    markOrderPaid,
    toggleProductAvailability,
    updateProductPrice,
    addMenuProduct,
    updateSettings,
    refreshOrders,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
