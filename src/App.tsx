import React from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { Storefront } from './components/Storefront';
import { StoreProvider, useStore } from './context/StoreContext';

const AppRouter: React.FC = () => {
  const { route, isAdminUnlocked } = useStore();

  return (
    <>
      {route === 'admin' && isAdminUnlocked ? <AdminDashboard /> : <Storefront />}
      <CartDrawer />
      <OrderTrackerModal />
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}
