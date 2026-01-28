import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  sortBy: 'price' | 'weight' | 'popular';
  setSortBy: (sort: 'price' | 'weight' | 'popular') => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [sortBy, setSortBy] = useState<'price' | 'weight' | 'popular'>('popular');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getCurrentUser()
        .then(userData => {
          console.log('User loaded:', userData);
          setUser(userData);
        })
        .catch((error) => {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      language,
      setLanguage,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      sortBy,
      setSortBy,
      emailNotifications,
      setEmailNotifications,
      smsNotifications,
      setSmsNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
