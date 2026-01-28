export interface Product {
  id: string;
  name: string;
  price: number;
  weight: string;
  image: string;
  category: string;
  popularity: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: "Lay's Classic Salted",
    price: 20,
    weight: '52g',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
    category: 'Snacks',
    popularity: 95,
  },
  {
    id: '2',
    name: 'Coca-Cola',
    price: 40,
    weight: '750ml',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
    category: 'Beverages',
    popularity: 98,
  },
  {
    id: '3',
    name: 'Kurkure Masala Munch',
    price: 10,
    weight: '35g',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
    category: 'Snacks',
    popularity: 88,
  },
  {
    id: '4',
    name: 'Pepsi',
    price: 35,
    weight: '600ml',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop',
    category: 'Beverages',
    popularity: 92,
  },
  {
    id: '5',
    name: 'Haldiram Namkeen Mix',
    price: 45,
    weight: '200g',
    image: 'https://images.unsplash.com/photo-1613919517925-e1f74e46be8d?w=400&h=400&fit=crop',
    category: 'Snacks',
    popularity: 85,
  },
  {
    id: '6',
    name: 'Amul Butter',
    price: 56,
    weight: '100g',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
    category: 'Dairy',
    popularity: 90,
  },
  {
    id: '7',
    name: 'Sprite',
    price: 38,
    weight: '600ml',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop',
    category: 'Beverages',
    popularity: 87,
  },
  {
    id: '8',
    name: 'Pringles Original',
    price: 99,
    weight: '107g',
    image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop',
    category: 'Snacks',
    popularity: 82,
  },
  {
    id: '9',
    name: 'Tata Tea Gold',
    price: 120,
    weight: '250g',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
    category: 'Groceries',
    popularity: 94,
  },
  {
    id: '10',
    name: 'Thums Up',
    price: 40,
    weight: '750ml',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',
    category: 'Beverages',
    popularity: 91,
  },
  {
    id: '11',
    name: 'Amul Milk',
    price: 28,
    weight: '500ml',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    category: 'Dairy',
    popularity: 96,
  },
  {
    id: '12',
    name: 'Bingo Mad Angles',
    price: 20,
    weight: '65g',
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop',
    category: 'Snacks',
    popularity: 80,
  },
];

export const categories = ['All', 'Snacks', 'Beverages', 'Dairy', 'Groceries'];
