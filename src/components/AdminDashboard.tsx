import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Truck,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { INITIAL_MENU } from '../data/menuData';
import { useStore } from '../context/StoreContext';
import { AdminTab, MenuCategory, Order, OrderStatus } from '../types';
import { formatBRL, formatClockTime, formatTimeAgo } from '../utils/formatters';
import { QueroBurgerLogo } from './Logo';

const STATUS_META: Record<
  OrderStatus,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  novo: {
    label: 'Novo',
    colorClass: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10',
    icon: <Clock className="w-4 h-4" />,
  },
  preparando: {
    label: 'Preparando',
    colorClass: 'text-orange-400 border-orange-500/50 bg-orange-500/15',
    icon: <Flame className="w-4 h-4" />,
  },
  entrega: {
    label: 'Saiu para Entrega',
    colorClass: 'text-yellow-300 border-yellow-300/40 bg-yellow-400/10',
    icon: <Truck className="w-4 h-4" />,
  },
  entregue: {
    label: 'Entregue',
    colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    menu,
    settings,
    lockAdmin,
    changeOrderStatus,
    markOrderPaid,
    refreshOrders,
    toggleProductAvailability,
    updateProductPrice,
    addMenuProduct,
    updateSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('pedidos');
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Novo item de cardápio
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState<MenuCategory>('Smash');

  // Configurações locais
  const [draftSettings, setDraftSettings] = useState(settings);
  const [savedToast, setSavedToast] = useState(false);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'entregue').length;
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const paidPixCount = orders.filter(
      (o) => o.paymentMethod === 'pix' && o.paymentStatus === 'pago',
    ).length;
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
    return { activeOrders, totalRevenue, paidPixCount, avgTicket };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'todos') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(newPrice.replace(',', '.'));
    if (!newName.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) return;

    const fallbackImg =
      INITIAL_MENU.find((m) => m.category === newCat)?.image ?? INITIAL_MENU[0].image;

    await addMenuProduct({
      name: newName.trim(),
      description: newDesc.trim() || 'Preparado artesanalmente na chapa Quero Burgers.',
      price: numericPrice,
      category: newCat,
      image: fallbackImg,
      available: true,
      prepMinutes: 15,
    });
    setNewName('');
    setNewDesc('');
    setNewPrice('');
    setShowNewProductForm(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(draftSettings);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col lg:flex-row">
      {/* Sidebar Escura */}
      <aside className="w-full lg:w-68 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <QueroBurgerLogo size="sm" variant="on-dark" />
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto" aria-label="Menu Administrativo">
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'pedidos'
                  ? 'bg-orange-600 text-white'
                  : 'text-orange-50/80 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4" />
                Pedidos
              </span>
              {metrics.activeOrders > 0 && (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md tabular-nums bg-yellow-400 text-zinc-950">
                  {metrics.activeOrders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cardapio')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'cardapio'
                  ? 'bg-orange-600 text-white'
                  : 'text-orange-50/80 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Cardápio
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftSettings(settings);
                setActiveTab('configuracoes');
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'configuracoes'
                  ? 'bg-orange-600 text-white'
                  : 'text-orange-50/80 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Configurações
            </button>
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-zinc-800 space-y-3">
          <div className="text-sm text-zinc-400 space-y-1">
            <p className="font-bold text-white">Unidade Vila Mathias</p>
            <p>Status: {settings.isOpen ? 'Aberta (Madrugada)' : 'Fechada'}</p>
          </div>
          <button
            type="button"
            onClick={lockAdmin}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-orange-500 text-sm font-bold text-orange-50 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Sair para Loja
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Quero Burgers · Gestão Interna ({activeTab})
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide mt-0.5">
              {activeTab === 'pedidos' && 'PAINEL DE PEDIDOS EM TEMPO REAL'}
              {activeTab === 'cardapio' && 'GESTÃO DO CARDÁPIO'}
              {activeTab === 'configuracoes' && 'CONFIGURAÇÕES DA OPERAÇÃO'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refreshOrders()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-orange-500 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-orange-500" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={lockAdmin}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-sm font-bold text-white whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Sair
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* ABA PEDIDOS */}
          {activeTab === 'pedidos' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-400">Pedidos em Aberto</span>
                  <p className="text-3xl font-extrabold text-orange-500 tabular-nums mt-1">
                    {metrics.activeOrders}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-400">
                    Faturamento da Noite
                  </span>
                  <p className="text-3xl font-extrabold text-white tabular-nums mt-1">
                    {formatBRL(metrics.totalRevenue)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-400">Pagos via Pix</span>
                  <p className="text-3xl font-extrabold text-emerald-400 tabular-nums mt-1">
                    {metrics.paidPixCount}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-yellow-400/40">
                  <span className="text-sm font-semibold text-zinc-300">Ticket Médio</span>
                  <p className="text-3xl font-extrabold text-yellow-400 tabular-nums mt-1">
                    {formatBRL(metrics.avgTicket)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
                  {(
                    [
                      { id: 'todos', label: 'Todos' },
                      { id: 'novo', label: 'Novos' },
                      { id: 'preparando', label: 'Preparando' },
                      { id: 'entrega', label: 'Saiu p/ Entrega' },
                      { id: 'entregue', label: 'Entregues' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3.5 py-2 rounded-lg text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                        statusFilter === tab.id
                          ? 'bg-orange-600 text-white'
                          : 'text-orange-50/75 hover:text-yellow-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('lista')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                      viewMode === 'lista'
                        ? 'bg-yellow-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('kanban')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-yellow-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Kanban
                  </button>
                </div>
              </div>

              {viewMode === 'lista' ? (
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-center">
                      <p className="font-display text-3xl text-white">
                        NENHUM PEDIDO NESTE STATUS
                      </p>
                      <p className="text-base text-zinc-400 mt-1">
                        Novos pedidos feitos no Storefront aparecerão aqui instantaneamente.
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <OrderAdminCard
                        key={order.id}
                        order={order}
                        onChangeStatus={changeOrderStatus}
                        onMarkPaid={markOrderPaid}
                        onViewReceipt={setReceiptOrder}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                  {(['novo', 'preparando', 'entrega', 'entregue'] as OrderStatus[]).map(
                    (colStatus) => {
                      const colOrders = orders.filter((o) => o.status === colStatus);
                      const meta = STATUS_META[colStatus];
                      return (
                        <div
                          key={colStatus}
                          className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3.5 space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
                              {meta.icon}
                              {meta.label}
                            </span>
                            <span className="text-sm font-extrabold text-yellow-400 tabular-nums">
                              {colOrders.length}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {colOrders.length === 0 ? (
                              <p className="text-sm text-zinc-500 text-center py-6">
                                Sem pedidos
                              </p>
                            ) : (
                              colOrders.map((order) => (
                                <OrderAdminCard
                                  key={order.id}
                                  order={order}
                                  compact
                                  onChangeStatus={changeOrderStatus}
                                  onMarkPaid={markOrderPaid}
                                  onViewReceipt={setReceiptOrder}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </>
          )}

          {/* ABA CARDÁPIO */}
          {activeTab === 'cardapio' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-base text-orange-50/80">
                  Controle disponibilidade e preços em tempo real no Storefront.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewProductForm((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              {showNewProductForm && (
                <form
                  onSubmit={handleAddProduct}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome do Burger / Combo"
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  />
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as MenuCategory)}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  >
                    <option value="Smash">Smash</option>
                    <option value="Artesanais">Artesanais</option>
                    <option value="Combos">Combos</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Preço (ex: 38.90)"
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white tabular-nums"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm"
                  >
                    Adicionar ao Cardápio
                  </button>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descrição dos ingredientes..."
                    className="md:col-span-4 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  />
                </form>
              )}

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-sm text-zinc-400">
                      <th className="py-3.5 px-4 font-bold">Produto</th>
                      <th className="py-3.5 px-4 font-bold">Categoria</th>
                      <th className="py-3.5 px-4 font-bold">Preço</th>
                      <th className="py-3.5 px-4 font-bold">Disponibilidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-[15px]">
                    {menu.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-sm text-zinc-400 line-clamp-1 max-w-md">
                            {item.description}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-orange-500">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4 font-bold tabular-nums text-yellow-400">
                          <div className="inline-flex items-center gap-2">
                            <span>{formatBRL(item.price)}</span>
                            <button
                              type="button"
                              onClick={() => void updateProductPrice(item.id, item.price + 2)}
                              className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-orange-600 text-white font-bold transition-colors"
                              title="Aumentar R$ 2,00"
                            >
                              +2
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => void toggleProductAvailability(item.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                              item.available
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {item.available ? 'Ativo na Loja' : 'Pausado'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA CONFIGURAÇÕES */}
          {activeTab === 'configuracoes' && (
            <form
              onSubmit={handleSaveSettings}
              className="max-w-2xl p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Status da Operação</h2>
                  <p className="text-sm text-zinc-400">
                    Define se clientes podem adicionar itens na sacola no Storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDraftSettings((s) => ({ ...s, isOpen: !s.isOpen }))
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    draftSettings.isOpen
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/50 text-red-400'
                  }`}
                >
                  {draftSettings.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-50 mb-1.5">
                    Horário Padrão
                  </label>
                  <input
                    type="text"
                    value={draftSettings.openHourLabel}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, openHourLabel: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-50 mb-1.5">
                    Taxa Fixa de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={draftSettings.fixedDeliveryFee}
                    onChange={(e) =>
                      setDraftSettings((s) => ({
                        ...s,
                        fixedDeliveryFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] font-semibold tabular-nums text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-50 mb-1.5">
                    Chave Pix Recebimento
                  </label>
                  <input
                    type="text"
                    value={draftSettings.pixKey}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, pixKey: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-50 mb-1.5">
                    Previsão de Entrega
                  </label>
                  <input
                    type="text"
                    value={draftSettings.estimatedMinutes}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, estimatedMinutes: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-50 mb-1.5">
                  Endereço Oficial
                </label>
                <input
                  type="text"
                  value={draftSettings.address}
                  onChange={(e) =>
                    setDraftSettings((s) => ({ ...s, address: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[15px] text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-colors"
                >
                  Salvar Configurações
                </button>
                {savedToast && (
                  <span className="text-sm font-bold text-emerald-400">
                    Configurações atualizadas na loja!
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Modal de Comprovante de Pagamento */}
      {receiptOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Comprovante de Pagamento"
        >
          <div className="absolute inset-0" onClick={() => setReceiptOrder(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-5 animate-fade-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-sm font-bold text-orange-500">
                  COMPROVANTE · {receiptOrder.orderNumber}
                </span>
                <h3 className="font-display text-3xl text-white mt-0.5">
                  DETALHES DO PAGAMENTO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[15px]">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cliente</span>
                <span className="text-white font-bold">{receiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Modalidade</span>
                <span className="text-orange-50 font-medium">
                  {receiptOrder.receipt?.methodLabel ?? receiptOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status Financeiro</span>
                <span
                  className={`font-bold ${
                    receiptOrder.paymentStatus === 'pago'
                      ? 'text-emerald-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {receiptOrder.paymentStatus === 'pago' ? 'Pago / Confirmado' : 'Pendente na Entrega'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">ID Transação / NSU</span>
                <span className="text-xs text-zinc-300">
                  {receiptOrder.receipt?.transactionId ?? 'N/A'}
                </span>
              </div>
              {receiptOrder.receipt?.pixKeyUsed && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Chave Pix Destino</span>
                  <span className="text-sm font-medium text-orange-50">
                    {receiptOrder.receipt.pixKeyUsed}
                  </span>
                </div>
              )}
              {receiptOrder.receipt?.changeFor && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Troco para</span>
                  <span className="font-bold text-yellow-400 tabular-nums">
                    {formatBRL(receiptOrder.receipt.changeFor)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Horário do Registro</span>
                <span className="text-sm font-semibold text-orange-50 tabular-nums">
                  {formatClockTime(receiptOrder.receipt?.paidAt ?? receiptOrder.createdAt)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-800 text-lg font-extrabold">
                <span className="text-white">Valor Total</span>
                <span className="text-yellow-400 tabular-nums">
                  {formatBRL(receiptOrder.total)}
                </span>
              </div>
            </div>

            {receiptOrder.paymentStatus === 'pendente' && (
              <button
                type="button"
                onClick={() => {
                  void markOrderPaid(receiptOrder.id);
                  setReceiptOrder({ ...receiptOrder, paymentStatus: 'pago' });
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
              >
                Confirmar Recebimento Agora
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderAdminCardProps {
  order: Order;
  compact?: boolean;
  onChangeStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onMarkPaid: (orderId: string) => Promise<void>;
  onViewReceipt: (order: Order) => void;
}

const OrderAdminCard: React.FC<OrderAdminCardProps> = ({
  order,
  compact = false,
  onChangeStatus,
  onMarkPaid,
  onViewReceipt,
}) => {
  const statusInfo = STATUS_META[order.status];

  return (
    <article className="rounded-2xl bg-zinc-900/85 border border-zinc-800 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-base font-extrabold text-orange-500">
              {order.orderNumber}
            </span>
            <span className="text-sm text-zinc-400 font-medium tabular-nums">
              {formatClockTime(order.createdAt)} ({formatTimeAgo(order.createdAt)})
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {order.customerName}{' '}
            <span className="text-sm font-medium text-zinc-400">· {order.customerPhone}</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${statusInfo.colorClass}`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-bold ${
              order.paymentStatus === 'pago'
                ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                : 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
            }`}
          >
            {order.paymentMethod.toUpperCase()} ·{' '}
            {order.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
          </span>
        </div>
      </div>

      <div
        className={`grid gap-4 pt-3 border-t border-zinc-800 ${
          compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
        }`}
      >
        <div className={compact ? '' : 'lg:col-span-6 space-y-1.5'}>
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Itens</p>
          <ul className="space-y-1 text-[15px]">
            {order.items.map((item, idx) => (
              <li key={`${item.productId}-${idx}`} className="text-orange-50 font-medium">
                <span className="text-orange-500 font-extrabold mr-2 tabular-nums">
                  {item.quantity}x
                </span>
                {item.name}
                {item.notes && (
                  <span className="block text-sm text-yellow-400 mt-0.5 ml-6">
                    Obs: {item.notes}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={compact ? '' : 'lg:col-span-4 space-y-1'}>
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Endereço</p>
          <p className="text-[15px] font-medium text-white">
            {order.address.street}, {order.address.number}
          </p>
          <p className="text-sm text-zinc-400">
            {order.address.neighborhood}
            {order.address.complement ? ` · ${order.address.complement}` : ''}
          </p>
        </div>

        <div
          className={
            compact
              ? 'flex items-center justify-between pt-2 border-t border-zinc-800'
              : 'lg:col-span-2 lg:text-right'
          }
        >
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Total</p>
          <p className="text-xl font-extrabold text-yellow-400 tabular-nums mt-0.5">
            {formatBRL(order.total)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onViewReceipt(order)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-950 hover:border-orange-500 text-sm font-semibold text-orange-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-orange-500" />
            Ver Comprovante
          </button>

          {order.paymentStatus === 'pendente' && (
            <button
              type="button"
              onClick={() => void onMarkPaid(order.id)}
              className="px-3.5 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-sm font-bold text-emerald-400 transition-colors"
            >
              Marcar Pago
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.status === 'novo' && (
            <button
              type="button"
              onClick={() => void onChangeStatus(order.id, 'preparando')}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-colors"
            >
              Aceitar e Marcar Preparando
            </button>
          )}

          {order.status === 'preparando' && (
            <button
              type="button"
              onClick={() => void onChangeStatus(order.id, 'entrega')}
              className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-sm transition-colors"
            >
              Saiu para Entrega
            </button>
          )}

          {order.status === 'entrega' && (
            <button
              type="button"
              onClick={() => void onChangeStatus(order.id, 'entregue')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              Confirmar Entrega
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
