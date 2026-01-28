export interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-12-05',
    status: 'delivered',
    total: 245,
    items: [
      { name: "Lay's Classic Salted", quantity: 3, price: 20 },
      { name: 'Coca-Cola', quantity: 2, price: 40 },
      { name: 'Amul Butter', quantity: 1, price: 56 },
    ],
  },
  {
    id: 'ORD-002',
    date: '2024-12-07',
    status: 'shipped',
    total: 178,
    items: [
      { name: 'Pepsi', quantity: 2, price: 35 },
      { name: 'Pringles Original', quantity: 1, price: 99 },
    ],
  },
  {
    id: 'ORD-003',
    date: '2024-12-08',
    status: 'processing',
    total: 320,
    items: [
      { name: 'Tata Tea Gold', quantity: 2, price: 120 },
      { name: 'Amul Milk', quantity: 3, price: 28 },
    ],
  },
];
