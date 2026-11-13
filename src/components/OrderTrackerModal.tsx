import React from 'react';
import { CheckCircle2, Clock, Flame, Navigation, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import { formatBRL, formatClockTime } from '../utils/formatters';

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'novo', label: 'Recebido', icon: <Clock className="w-5 h-5" /> },
  { key: 'preparando', label: 'Na Chapa', icon: <Flame className="w-5 h-5" /> },
  { key: 'entrega', label: 'Em Rota', icon: <Navigation className="w-5 h-5" /> },
  { key: 'entregue', label: 'Entregue', icon: <CheckCircle2 className="w-5 h-5" /> },
];

export const OrderTrackerModal: React.FC = () => {
  const {
    isTrackerOpen,
    setIsTrackerOpen,
    orders,
    activeCustomerOrderId,
    setActiveCustomerOrderId,
  } = useStore();

  if (!isTrackerOpen) return null;

  const selectedOrder =
    orders.find((o) => o.id === activeCustomerOrderId) ?? orders[0] ?? null;

  const currentStepIdx = selectedOrder
    ? STATUS_STEPS.findIndex((s) => s.key === selectedOrder.status)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Acompanhamento de Pedido"
    >
      <div className="absolute inset-0" onClick={() => setIsTrackerOpen(false)} />

      <div className="relative z-10 w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
          <div>
            <h2 className="font-display text-3xl text-white tracking-wide">
              ACOMPANHAR PEDIDO
            </h2>
            <p className="text-sm text-orange-50/75">
              Atualizado em sincronia com a cozinha da Quero Burgers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTrackerOpen(false)}
            className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center"
            aria-label="Fechar rastreamento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {orders.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {orders.slice(0, 5).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setActiveCustomerOrderId(ord.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-bold whitespace-nowrap shrink-0 border transition-colors ${
                    selectedOrder?.id === ord.id
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-zinc-900 text-orange-50 border-zinc-800 hover:border-orange-500/50'
                  }`}
                >
                  {ord.orderNumber}
                </button>
              ))}
            </div>
          )}

          {selectedOrder ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-sm font-bold text-orange-500">
                    {selectedOrder.orderNumber}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {selectedOrder.customerName}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Pedido às {formatClockTime(selectedOrder.createdAt)} ·{' '}
                    {selectedOrder.address.street}, {selectedOrder.address.number}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-zinc-400 font-medium">Total</span>
                  <span className="text-2xl font-extrabold text-yellow-400 tabular-nums">
                    {formatBRL(selectedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-xl border text-center transition-colors ${
                        isCurrent
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : isDone
                            ? 'bg-zinc-900 border-yellow-400/60 text-yellow-400'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="flex justify-center mb-1.5">{step.icon}</div>
                      <span className="text-sm font-bold block">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-zinc-300">Itens do pedido</p>
                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-900 border border-zinc-800 px-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="py-3.5 flex items-center justify-between text-[15px]"
                    >
                      <span className="text-orange-50 font-medium">
                        <span className="text-orange-500 font-bold mr-2 tabular-nums">
                          {item.quantity}x
                        </span>
                        {item.name}
                      </span>
                      <span className="font-bold text-yellow-400 tabular-nums">
                        {formatBRL(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-base text-zinc-400 text-center py-8">
              Nenhum pedido realizado ainda nesta sessão.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
