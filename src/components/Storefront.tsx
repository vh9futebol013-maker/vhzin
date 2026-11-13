import React, { useMemo, useRef, useState } from 'react';
import {
  Clock,
  Flame,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { HERO_IMAGE } from '../data/menuData';
import { useStore } from '../context/StoreContext';
import { MenuCategory } from '../types';
import { formatBRL } from '../utils/formatters';
import { QueroBurgerLogo } from './Logo';
import { ProductImage } from './ProductImage';

const CATEGORIES: ('Todos' | MenuCategory)[] = [
  'Todos',
  'Smash',
  'Artesanais',
  'Combos',
  'Bebidas',
];

export const Storefront: React.FC = () => {
  const {
    menu,
    cart,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsTrackerOpen,
    addToCart,
    updateCartQuantity,
    unlockAdmin,
    settings,
    orders,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<'Todos' | MenuCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Easter Egg secreto: 3 cliques rápidos em "2026" no rodapé desbloqueiam o painel admin
  const secretClickTimesRef = useRef<number[]>([]);
  const handleSecretYearClick = () => {
    const now = Date.now();
    const recent = secretClickTimesRef.current.filter((t) => now - t < 1500);
    recent.push(now);
    secretClickTimesRef.current = recent;
    if (recent.length >= 3) {
      secretClickTimesRef.current = [];
      unlockAdmin();
    }
  };

  const filteredMenu = useMemo(() => {
    return menu.filter((product) => {
      if (!product.available) return false;
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const getProductQtyInCart = (productId: string): number => {
    return cart.find((item) => item.product.id === productId)?.quantity ?? 0;
  };

  const activeOrderCount = orders.filter((o) => o.status !== 'entregue').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header Laranja da Marca (zero bg-white, sem links de admin) */}
      <header className="sticky top-0 z-40 bg-orange-600 border-b border-orange-500/80 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zona 1: Logotipo Q-Burger */}
          <a
            href="#topo"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded-lg"
          >
            <QueroBurgerLogo variant="on-orange" />
          </a>

          {/* Zona 2: Links públicos limpos (sem Painel Admin) */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-8 text-[15px] font-bold text-orange-50"
          >
            <a
              href="#cardapio"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0"
            >
              Cardápio
            </a>
            <a
              href="#madrugada"
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0"
            >
              A Casa
            </a>
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0"
            >
              Meus Pedidos{activeOrderCount > 0 ? ` (${activeOrderCount})` : ''}
            </button>
          </nav>

          {/* Zona 3: Botão Sacola com contraste escuro + amarelo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-[15px] transition-colors whitespace-nowrap shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
              aria-label={`Abrir sacola com ${cartCount} itens`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>Sacola</span>
              <span className="text-sm font-extrabold bg-yellow-400 text-zinc-950 px-2.5 py-0.5 rounded-md tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="topo" className="flex-1">
        {/* Hero Section: Imagem em background full-screen + overlay preto translúcido */}
        <section
          className="relative min-h-screen flex items-center bg-cover bg-center border-b border-zinc-800/80"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          {/* Overlay preto translúcido para leitura perfeita */}
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/40 to-black/50" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-3xl space-y-7">
              {/* Status Operacional com fonte grande e legível */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base sm:text-lg font-semibold text-orange-50">
                <span className="inline-flex items-center gap-2.5 text-white">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      settings.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{settings.isOpen ? 'Aberto até as 04h' : 'Fechado no momento'}</span>
                </span>
                <span className="text-zinc-400" aria-hidden="true">
                  ·
                </span>
                <span className="text-orange-50">Vila Mathias, Santos - SP</span>
                <span className="text-zinc-400" aria-hidden="true">
                  ·
                </span>
                <span className="text-yellow-400 font-bold">
                  Entrega {settings.estimatedMinutes}
                </span>
              </div>

              {/* Título Gigante Condensado */}
              <h1
                className="font-display text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.94] tracking-wide text-white uppercase"
                style={{ textWrap: 'balance' }}
              >
                O BURGER QUE VOCÊ QUER,{' '}
                <span className="text-orange-500">NA HORA QUE VOCÊ</span>{' '}
                <span className="text-yellow-400">PRECISA</span>
              </h1>

              <p className="text-lg sm:text-xl text-orange-50/90 max-w-xl leading-relaxed font-medium">
                Smash crocante na chapa de ferro, blends Angus de 180g e combos pensados para
                salvar sua madrugada em Santos até as 04h — Sexta e Sábado até 05h.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#cardapio"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-base tracking-wide transition-transform active:scale-[0.98] shadow-xl shadow-orange-600/30"
                >
                  <Flame className="w-5 h-5" />
                  Fazer Pedido Agora
                </a>
                <button
                  type="button"
                  onClick={() => setIsTrackerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-zinc-900/85 hover:bg-zinc-800 backdrop-blur-md border border-yellow-400/60 text-yellow-400 font-bold text-base transition-colors"
                >
                  Acompanhar Pedido
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cardápio Interativo */}
        <section id="cardapio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-yellow-400 mb-2">
                Direto da Chapa
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide leading-none">
                CARDÁPIO DA <span className="text-orange-500">MADRUGADA</span>
              </h2>
            </div>

            {/* Busca e Filtros de Categoria */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar burger ou combo..."
                  aria-label="Buscar no cardápio"
                  className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div
                className="flex items-center gap-1 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto"
                role="tablist"
                aria-label="Categorias do cardápio"
              >
                {CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-orange-600 text-white'
                          : 'text-orange-50/80 hover:text-yellow-400'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredMenu.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
              <p className="font-display text-3xl text-white">NENHUM ITEM ENCONTRADO</p>
              <p className="text-base text-orange-50/75 mt-1">
                Tente limpar a busca ou selecionar outra categoria do cardápio.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-bold text-white transition-colors"
              >
                Mostrar Todos os Produtos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredMenu.map((product) => {
                const qtyInCart = getProductQtyInCart(product.id);
                return (
                  <article
                    key={product.id}
                    className="group flex flex-col rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 hover:border-orange-500/60 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {/* Imagem 4:3 */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-300 mb-2">
                          <span className="text-orange-500">{product.category}</span>
                          {product.prepMinutes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{product.prepMinutes} min</span>
                            </>
                          )}
                          {product.highlight && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-yellow-400 font-bold">
                                {product.highlight}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="font-condensed text-2xl font-bold text-white tracking-wide leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-[15px] text-orange-50/75 mt-2 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Preço e Ação */}
                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
                        <div>
                          <span className="block text-xs font-medium text-zinc-400">
                            Valor unitário
                          </span>
                          <span className="text-2xl font-extrabold text-yellow-400 tabular-nums">
                            {formatBRL(product.price)}
                          </span>
                        </div>

                        {qtyInCart > 0 ? (
                          <div className="inline-flex items-center rounded-xl border border-orange-500 bg-zinc-950 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, -1)}
                              className="w-9 h-9 flex items-center justify-center text-white hover:text-orange-400 transition-colors"
                              aria-label={`Remover um ${product.name}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-base font-extrabold text-yellow-400 tabular-nums">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, 1)}
                              className="w-9 h-9 flex items-center justify-center text-white hover:text-orange-400 transition-colors"
                              aria-label={`Adicionar mais um ${product.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!settings.isOpen}
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-[15px] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Seção Institucional / Dossiê da Madrugada (zero links de admin) */}
        <section id="madrugada" className="border-t border-zinc-800/90 bg-zinc-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-yellow-400 mb-2">
                    Vila Mathias · Santos - SP
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
                    COZINHA QUENTE QUANDO A <span className="text-orange-500">CIDADE DORME</span>
                  </h2>
                  <p className="text-base text-orange-50/85 mt-4 leading-relaxed">
                    A Quero Burgers nasceu para entregar hambúrguer artesanal de verdade fora do
                    horário comum. Preparamos cada blend fresco na chapa em alta temperatura para
                    garantir crosta caramelizada, queijo derretido e entrega rápida em toda Santos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-zinc-800">
                  <div>
                    <span className="text-sm font-medium text-zinc-400 block">Dom a Qui</span>
                    <span className="text-lg font-bold text-white tabular-nums mt-1 block">
                      {settings.openHourLabel}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-400 block">Sex e Sábado</span>
                    <span className="text-lg font-extrabold text-yellow-400 tabular-nums mt-1 block">
                      17:00 às 05:00
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-400 block">
                      Taxa Fixa Delivery
                    </span>
                    <span className="text-lg font-extrabold text-orange-500 tabular-nums mt-1 block">
                      {formatBRL(settings.fixedDeliveryFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 flex flex-col justify-center gap-6">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-base font-bold text-white">Endereço da Cozinha</h3>
                    <p className="text-[15px] text-orange-50/80 mt-1">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-base font-bold text-white">Horário Estendido</h3>
                    <p className="text-[15px] text-orange-50/80 mt-1">
                      {settings.openHourLabel} ({settings.weekendHourLabel})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-base font-bold text-white">Pagamento Facilitado</h3>
                    <p className="text-[15px] text-orange-50/80 mt-1">
                      Pix Online com aprovação instantânea, Cartão na entrega ou Dinheiro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Escuro com Easter Egg Secreto no Ano "2026" (3 cliques rápidos) */}
      <footer className="border-t border-zinc-800/90 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>
              ©{' '}
              <button
                type="button"
                onClick={handleSecretYearClick}
                className="cursor-default select-none focus:outline-none"
                tabIndex={-1}
                aria-label="Ano de copyright"
              >
                2026
              </button>{' '}
              <span className="font-bold text-orange-500">Quero Burgers</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Todos os direitos reservados · Vila Mathias, Santos - SP</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="#cardapio" className="hover:text-orange-400 transition-colors">
              Cardápio
            </a>
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="hover:text-yellow-400 transition-colors"
            >
              Rastrear Pedido
            </button>
          </div>
        </div>
      </footer>

      {/* Barra Flutuante Compacta no Mobile quando houver itens na sacola */}
      {cartCount > 0 && (
        <div className="md:hidden fixed bottom-3 left-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full px-4 py-3.5 rounded-xl bg-orange-600 text-white font-bold text-base shadow-2xl flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Ver Sacola ({cartCount})
            </span>
            <span className="bg-yellow-400 text-zinc-950 px-3 py-0.5 rounded-lg font-extrabold tabular-nums">
              {formatBRL(cartSubtotal)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
