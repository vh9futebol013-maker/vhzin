import { Order, Product, StoreSettings } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_quero_burger_1794603132874.jpg';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Quero Burgers',
  address: 'Av. Washington Luís, 191 - Vila Mathias, Santos - SP, 11030-180',
  openHourLabel: '17:00 às 04:00',
  weekendHourLabel: 'Sex e Sáb até 05:00',
  isOpen: true,
  fixedDeliveryFee: 8.9,
  minOrderValue: 25.0,
  pixKey: 'pix@queroburgers.com.br',
  estimatedMinutes: '30–45 min',
};

export const INITIAL_MENU: Product[] = [
  {
    id: 'qb-smash-duplo',
    name: 'Q-Smash Duplo Bacon',
    description:
      'Dois blends bovinos de 90g prensados na chapa quente com crostinha crocante, cheddar americano derretido, picles artesanal, cebola picada e molho da casa no brioche tostado.',
    price: 34.9,
    category: 'Smash',
    image: '/src/assets/images/menu_smash_duplo_1794603133004.jpg',
    available: true,
    highlight: 'Mais Pedido',
    prepMinutes: 14,
  },
  {
    id: 'qb-smash-salad',
    name: 'Q-Smash Fresh',
    description:
      'Smash burger 100g suculento com queijo prato derretido, alface americana crocante, tomate italiano, cebola roxa e maionese de alho assado no pão brioche selado na manteiga.',
    price: 28.9,
    category: 'Smash',
    image: '/src/assets/images/menu_smash_salad_1794603132740.jpg',
    available: true,
    prepMinutes: 12,
  },
  {
    id: 'qb-smash-triplo',
    name: 'Madrugada Triplo Melt',
    description:
      'Para quem não brinca na madrugada: 3 carnes smash de 90g, triplo cheddar cremoso, cebola caramelizada no shoyu e molho defumado no pão brioche.',
    price: 42.9,
    category: 'Smash',
    image: '/src/assets/images/menu_smash_duplo_1794603133004.jpg',
    available: true,
    highlight: 'Madrugada',
    prepMinutes: 16,
  },
  {
    id: 'qb-art-washington',
    name: 'Washington 180g Bacon',
    description:
      'Burger alto 180g de Angus na brasa, fatias espessas de bacon artesanal defumado, cheddar maturado, geleia de cebola roxa e rúcula fresca no brioche com gergelim.',
    price: 44.9,
    category: 'Artesanais',
    image: '/src/assets/images/menu_artesanal_bacon_1794603133730.jpg',
    available: true,
    highlight: 'Especial da Casa',
    prepMinutes: 20,
  },
  {
    id: 'qb-art-brasa',
    name: 'Vila Mathias Smoke',
    description:
      'Hambúrguer artesanal 180g selado no ponto perfeito, queijo gouda derretido, bacon crocante em tiras, maionese de páprica defumada e cebola crispy.',
    price: 46.9,
    category: 'Artesanais',
    image: '/src/assets/images/menu_artesanal_bacon_1794603133730.jpg',
    available: true,
    prepMinutes: 20,
  },
  {
    id: 'qb-art-rustico',
    name: 'Canal 3 Gorgonzola',
    description:
      'Blend Angus 180g, creme de gorgonzola suave, bacon tostado, tomate confit e redução balsâmica no pão brioche artesanal.',
    price: 45.9,
    category: 'Artesanais',
    image: '/src/assets/images/menu_smash_salad_1794603132740.jpg',
    available: true,
    prepMinutes: 20,
  },
  {
    id: 'qb-combo-insonia',
    name: 'Combo Insônia Duplo',
    description:
      'Q-Smash Duplo + Porção generosa de batatas crinkle temperadas com páprica e alecrim + Molho cheddar & alho + Refrigerante gelado 350ml.',
    price: 54.9,
    category: 'Combos',
    image: '/src/assets/images/menu_combo_madrugada_1794603133197.jpg',
    available: true,
    highlight: 'Melhor Custo',
    prepMinutes: 18,
  },
  {
    id: 'qb-combo-casal',
    name: 'Combo Madrugada Pra Dois',
    description:
      '2 Q-Smash Duplo Bacon + 1 Batata Crinkle G com cheddar e bacon + 2 Refrigerantes 350ml bem gelados para salvar o rolê.',
    price: 96.9,
    category: 'Combos',
    image: '/src/assets/images/menu_combo_madrugada_1794603133197.jpg',
    available: true,
    prepMinutes: 22,
  },
  {
    id: 'qb-bebida-cola',
    name: 'Craft Cola & Limão 400ml',
    description:
      'Cola artesanal ultra gelada servida com cubos de gelo cristalino e rodela de limão tahiti fresco.',
    price: 11.9,
    category: 'Bebidas',
    image: '/src/assets/images/menu_bebida_gelada_1794603134238.jpg',
    available: true,
    prepMinutes: 4,
  },
  {
    id: 'qb-bebida-shake',
    name: 'Shake Cacau 70% 450ml',
    description:
      'Milkshake cremoso batido com sorvete artesanal de baunilha, ganache de chocolate meio amargo e finalizado com cacau polvilhado.',
    price: 22.9,
    category: 'Bebidas',
    image: '/src/assets/images/menu_bebida_gelada_1794603134238.jpg',
    available: true,
    highlight: 'Gelado',
    prepMinutes: 6,
  },
];

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    orderNumber: 'QB-1048',
    createdAt: minsAgo(4),
    customerName: 'Lucas Mendonça',
    customerPhone: '(13) 99742-1810',
    address: {
      street: 'Av. Ana Costa',
      number: '412',
      neighborhood: 'Gonzaga',
      complement: 'Apto 74 - Bloco B',
    },
    items: [
      {
        productId: 'qb-smash-duplo',
        name: 'Q-Smash Duplo Bacon',
        quantity: 2,
        unitPrice: 34.9,
      },
      {
        productId: 'qb-bebida-cola',
        name: 'Craft Cola & Limão 400ml',
        quantity: 2,
        unitPrice: 11.9,
      },
    ],
    subtotal: 93.6,
    deliveryFee: 8.9,
    total: 102.5,
    status: 'novo',
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    receipt: {
      transactionId: 'E18236120202611131247QB1048',
      paidAt: minsAgo(4),
      methodLabel: 'Pix Online Instantâneo',
      pixKeyUsed: 'pix@queroburgers.com.br',
    },
  },
  {
    id: 'ord-1047',
    orderNumber: 'QB-1047',
    createdAt: minsAgo(16),
    customerName: 'Mariana Tavares',
    customerPhone: '(13) 99108-4432',
    address: {
      street: 'Rua Braz Cubas',
      number: '285',
      neighborhood: 'Vila Mathias',
      complement: 'Portão preto',
    },
    items: [
      {
        productId: 'qb-combo-insonia',
        name: 'Combo Insônia Duplo',
        quantity: 1,
        unitPrice: 54.9,
        notes: 'Sem picles, por favor',
      },
      {
        productId: 'qb-bebida-shake',
        name: 'Shake Cacau 70% 450ml',
        quantity: 1,
        unitPrice: 22.9,
      },
    ],
    subtotal: 77.8,
    deliveryFee: 8.9,
    total: 86.7,
    status: 'preparando',
    paymentMethod: 'cartao',
    paymentStatus: 'pendente',
    receipt: {
      transactionId: 'POS-ENTREGA-1047',
      paidAt: minsAgo(16),
      methodLabel: 'Cartão na Entrega (Crédito)',
    },
  },
  {
    id: 'ord-1046',
    orderNumber: 'QB-1046',
    createdAt: minsAgo(29),
    customerName: 'Rafael Santoro',
    customerPhone: '(13) 98821-7709',
    address: {
      street: 'Av. Conselheiro Nébias',
      number: '710',
      neighborhood: 'Boqueirão',
      complement: 'Portaria 24h',
    },
    items: [
      {
        productId: 'qb-art-washington',
        name: 'Washington 180g Bacon',
        quantity: 1,
        unitPrice: 44.9,
      },
    ],
    subtotal: 44.9,
    deliveryFee: 8.9,
    total: 53.8,
    status: 'entrega',
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    receipt: {
      transactionId: 'E18236120202611131222QB1046',
      paidAt: minsAgo(29),
      methodLabel: 'Pix Online Instantâneo',
      pixKeyUsed: 'pix@queroburgers.com.br',
    },
  },
];
