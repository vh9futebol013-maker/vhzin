import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Trash2,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentMethod } from '../types';
import { formatBRL } from '../utils/formatters';
import { ProductImage } from './ProductImage';

const SANTOS_BAIRROS = [
  'Vila Mathias',
  'Gonzaga',
  'Boqueirão',
  'Embaré',
  'Ponta da Praia',
  'Campo Grande',
  'José Menino',
  'Pompeia',
  'Encruzilhada',
  'Macuco',
];

function generateSimulatedPixPayload(total: number, pixKey: string): string {
  const amount = total.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0126${pixKey}520400005303986540${amount.length}${amount}5802BR5913QUERO BURGERS6006SANTOS62070503QB16304A9F2`;
}

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    settings,
    placeOrder,
    setIsTrackerOpen,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'pix-confirm' | 'success'>('cart');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('Vila Mathias');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const deliveryFee = deliveryMode === 'pickup' ? 0 : settings.fixedDeliveryFee;
  const total = cartSubtotal + (cart.length > 0 ? deliveryFee : 0);

  const pixCode = useMemo(
    () => generateSimulatedPixPayload(total, settings.pixKey),
    [total, settings.pixKey],
  );

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'success') {
      setStep('cart');
      setCreatedOrder(null);
    }
  };

  const validateCheckout = (): boolean => {
    if (!customerName.trim()) {
      setFormError('Informe seu nome para identificar o pedido.');
      return false;
    }
    if (!customerPhone.trim()) {
      setFormError('Informe seu WhatsApp para atualizações da entrega.');
      return false;
    }
    if (deliveryMode === 'delivery' && (!street.trim() || !number.trim())) {
      setFormError('Preencha rua e número do endereço de entrega.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    if (paymentMethod === 'pix') {
      setStep('pix-confirm');
      return;
    }

    await finalizeOrder('pendente');
  };

  const finalizeOrder = async (paymentStatus: 'pago' | 'pendente') => {
    setIsSubmitting(true);
    try {
      const parsedChange = changeFor ? parseFloat(changeFor.replace(',', '.')) : undefined;
      const order = await placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address:
          deliveryMode === 'pickup'
            ? {
                street: 'Av. Washington Luís',
                number: '191',
                neighborhood: 'Vila Mathias (Retirada no Balcão)',
                isPickup: true,
              }
            : {
                street: street.trim(),
                number: number.trim(),
                neighborhood,
                complement: complement.trim() || undefined,
              },
        items: cart.map((c) => ({
          productId: c.product.id,
          name: c.product.name,
          quantity: c.quantity,
          unitPrice: c.product.price,
          notes: c.notes,
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus,
        changeFor: paymentMethod === 'dinheiro' && parsedChange ? parsedChange : undefined,
        pixKeyUsed: paymentMethod === 'pix' ? settings.pixKey : undefined,
      });
      setCreatedOrder(order);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2200);
    } catch {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sacola e Checkout Quero Burgers"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <aside className="relative z-10 w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col animate-drawer-in shadow-2xl">
        {/* Header da Gaveta */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white leading-none">
              {step === 'cart' && 'SUA SACOLA'}
              {step === 'checkout' && 'ENTREGA & PAGAMENTO'}
              {step === 'pix-confirm' && 'PAGAMENTO VIA PIX'}
              {step === 'success' && 'PEDIDO CONFIRMADO'}
            </h2>
            <p className="text-sm text-orange-50/75 mt-1">
              {step === 'cart' && 'Revise seus burgers antes de mandar pra chapa'}
              {step === 'checkout' && `Previsão de entrega: ${settings.estimatedMinutes}`}
              {step === 'pix-confirm' && 'Escaneie ou copie o código Pix abaixo'}
              {step === 'success' && 'Seu pedido já caiu na cozinha da Quero Burgers'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-orange-500/50 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-orange-500" />
                  </div>
                  <p className="font-display text-3xl text-white tracking-wide">
                    SACOLA VAZIA
                  </p>
                  <p className="text-base text-orange-50/75 mt-2 max-w-[26ch]">
                    Escolha um Smash, Artesanal ou Combo do cardápio para começar seu pedido.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-colors"
                  >
                    Explorar Cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3.5 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800"
                    >
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 bg-zinc-950"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-condensed text-lg font-bold text-white leading-tight truncate">
                            {item.product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                            aria-label={`Remover ${item.product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-orange-500 font-semibold mt-0.5">
                          {item.product.category}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base font-extrabold text-yellow-400 tabular-nums">
                            {formatBRL(item.product.price * item.quantity)}
                          </span>
                          <div className="inline-flex items-center rounded-lg border border-orange-500/70 bg-zinc-950">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:text-orange-400 transition-colors"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold text-white tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-200 hover:text-orange-400 transition-colors"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleProceedCheckout} className="space-y-5">
              {/* Modo de Entrega */}
              <div>
                <label className="block text-sm font-bold text-orange-50 mb-2">
                  Como deseja receber?
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('delivery')}
                    className={`py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      deliveryMode === 'delivery'
                        ? 'bg-orange-600 text-white'
                        : 'text-orange-50/75 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Delivery ({formatBRL(settings.fixedDeliveryFee)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('pickup')}
                    className={`py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      deliveryMode === 'pickup'
                        ? 'bg-orange-600 text-white'
                        : 'text-orange-50/75 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Retirar (Grátis)
                  </button>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="qb-name" className="block text-sm font-semibold text-orange-50 mb-1.5">
                    Seu Nome
                  </label>
                  <input
                    id="qb-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Gabriel Costa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="qb-phone" className="block text-sm font-semibold text-orange-50 mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    id="qb-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(13) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Endereço */}
              {deliveryMode === 'delivery' ? (
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <p className="text-sm font-bold text-white">Endereço em Santos - SP</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label htmlFor="qb-street" className="block text-sm text-zinc-300 mb-1">
                        Rua / Avenida
                      </label>
                      <input
                        id="qb-street"
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Av. Ana Costa"
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="qb-number" className="block text-sm text-zinc-300 mb-1">
                        Número
                      </label>
                      <input
                        id="qb-number"
                        type="text"
                        required
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="412"
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="qb-bairro" className="block text-sm text-zinc-300 mb-1">
                        Bairro
                      </label>
                      <select
                        id="qb-bairro"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white focus:outline-none focus:border-orange-500"
                      >
                        {SANTOS_BAIRROS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="qb-comp" className="block text-sm text-zinc-300 mb-1">
                        Complemento
                      </label>
                      <input
                        id="qb-comp"
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto 32"
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-orange-50 space-y-1">
                  <p className="font-bold text-yellow-400">Retirada no Balcão — Vila Mathias</p>
                  <p className="text-zinc-300">{settings.address}</p>
                </div>
              )}

              {/* Forma de Pagamento */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800">
                <p className="text-sm font-bold text-white">Forma de Pagamento</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
                      paymentMethod === 'pix'
                        ? 'bg-orange-600/15 border-orange-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-orange-50/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <QrCode className="w-4 h-4 text-orange-500" />
                      Pix Online
                    </span>
                    <span className="text-xs font-bold text-yellow-400">Aprovação imediata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
                      paymentMethod === 'cartao'
                        ? 'bg-orange-600/15 border-orange-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-orange-50/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      Cartão na Entrega
                    </span>
                    <span className="text-xs text-zinc-400">Maquininha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
                      paymentMethod === 'dinheiro'
                        ? 'bg-orange-600/15 border-orange-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-orange-50/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <Wallet className="w-4 h-4 text-orange-500" />
                      Dinheiro na Entrega
                    </span>
                    <span className="text-xs text-zinc-400">Com troco</span>
                  </button>
                </div>

                {paymentMethod === 'dinheiro' && (
                  <div className="pt-1">
                    <label htmlFor="qb-troco" className="block text-sm text-zinc-300 mb-1">
                      Precisa de troco para quanto? (Opcional)
                    </label>
                    <input
                      id="qb-troco"
                      type="text"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      placeholder="Ex: 100,00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-sm text-red-300 bg-red-950/60 border border-red-800 rounded-xl px-3.5 py-2.5 font-medium">
                  {formError}
                </p>
              )}
            </form>
          )}

          {step === 'pix-confirm' && (
            <div className="space-y-5 text-center animate-fade-slide-up">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 inline-flex flex-col items-center">
                <div className="p-3 rounded-xl bg-zinc-100">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-44 h-44 text-zinc-950"
                    aria-label="QR Code Pix Quero Burgers"
                  >
                    <rect width="120" height="120" fill="#f4f4f5" />
                    <path
                      d="M8 8h28v28H8V8zm6 6v16h16V14H14zm6 6h4v4h-4v-4zM84 8h28v28H84V8zm6 6v16h16V14H90zm6 6h4v4h-4v-4zM8 84h28v28H8V84zm6 6v16h16V90H14zm6 6h4v4h-4v-4z"
                      fill="#09090b"
                    />
                    <path
                      d="M44 10h6v6h-6v-6zm12 0h12v6H56v-6zm18 6h6v12h-6V16zM44 22h12v6H44v-6zm18 6h6v12h-6V28zM10 44h12v6H10v-6zm18 0h6v12h-6V44zm12 6h18v6H40v-6zm24-6h12v6H64v-6zm18 0h12v6H82v-6zm18 6h12v12h-12V50zM10 56h12v6H10v-6zm24 6h12v12H34V62zm18-6h6v18h-6V56zm12 12h18v6H64v-6zm24-6h6v18h-6V62zm12 12h12v6h-12v-6zM44 84h12v6H44v-6zm18 6h12v6H62v-6zm18-6h12v12H80V84zm18 12h14v16H98V96zM44 96h6v16h-6V96zm12 6h18v10H56v-10zm24 0h12v10H80v-10z"
                      fill="#09090b"
                    />
                    <rect x="49" y="49" width="22" height="22" rx="4" fill="#ea580c" />
                    <text
                      x="60"
                      y="64"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      QB
                    </text>
                  </svg>
                </div>
                <p className="mt-4 text-2xl font-extrabold text-yellow-400 tabular-nums">
                  {formatBRL(total)}
                </p>
                <p className="text-sm text-orange-50/75 mt-1">
                  Favorecido: Quero Burgers · Chave: {settings.pixKey}
                </p>
              </div>

              <div className="text-left space-y-2">
                <label className="block text-sm font-semibold text-orange-50">
                  Pix Copia e Cola
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 text-sm font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedPix ? (
                      <Check className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedPix ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => finalizeOrder('pago')}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold text-[15px] transition-colors"
                >
                  {isSubmitting ? 'Confirmando Pagamento...' : 'Já paguei via Pix — Enviar Pedido'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-2.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Voltar e alterar forma de pagamento
                </button>
              </div>
            </div>
          )}

          {step === 'success' && createdOrder && (
            <div className="py-6 text-center space-y-5 animate-fade-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                  Pedido {createdOrder.orderNumber}
                </p>
                <h3 className="font-display text-4xl text-white mt-1">
                  MANDAMOS PRA CHAPA!
                </h3>
                <p className="text-base text-orange-50/80 mt-2">
                  Obrigado, <span className="text-white font-bold">{createdOrder.customerName}</span>.
                  Acompanhe o preparo em tempo real.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Pagamento</span>
                  <span className="text-white font-semibold">
                    {createdOrder.receipt?.methodLabel} ·{' '}
                    <span
                      className={
                        createdOrder.paymentStatus === 'pago'
                          ? 'text-emerald-400'
                          : 'text-yellow-400'
                      }
                    >
                      {createdOrder.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 gap-4">
                  <span>Entrega</span>
                  <span className="text-orange-50 text-right font-medium">
                    {createdOrder.address.street}, {createdOrder.address.number} ·{' '}
                    {createdOrder.address.neighborhood}
                  </span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-zinc-800 text-base font-bold text-white">
                  <span>Total</span>
                  <span className="text-yellow-400 tabular-nums">
                    {formatBRL(createdOrder.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setIsTrackerOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[15px] transition-colors"
                >
                  Acompanhar Status do Pedido
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Voltar ao Cardápio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Resumo e Ação */}
        {cart.length > 0 && (step === 'cart' || step === 'checkout') && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900 space-y-3">
            <div className="space-y-1.5 text-[15px]">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums text-white">
                  {formatBRL(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxa de entrega ({deliveryMode === 'pickup' ? 'Retirada' : 'Fixa Santos'})</span>
                <span className="font-semibold tabular-nums text-white">
                  {deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-white pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-yellow-400 tabular-nums">{formatBRL(total)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[15px] transition-colors"
              >
                Continuar para Endereço e Pagamento
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3.5 rounded-xl border border-zinc-700 text-orange-50 hover:text-white hover:border-zinc-500 text-sm font-bold transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold text-[15px] transition-colors"
                >
                  {isSubmitting
                    ? 'Enviando...'
                    : paymentMethod === 'pix'
                      ? 'Gerar QR Code Pix'
                      : 'Finalizar Pedido'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
