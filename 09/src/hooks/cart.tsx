import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@goMarketplace:data');

      if (data) setProducts(JSON.parse(data));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProductsChange(): Promise<void> {
      await AsyncStorage.setItem(
        '@goMarketplace:data',
        JSON.stringify(products),
      );
    }

    saveProductsChange();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productIdx = products.findIndex(self => self.id === id);

      if (productIdx < 0)
        throw new Error('You dont added this product to the cart yet');

      const updatedState = [...products];
      updatedState[productIdx].quantity += 1;
      setProducts(updatedState);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIdx = products.findIndex(self => self.id === id);

      if (productIdx < 0)
        throw new Error('You dont added this product to the cart yet');

      const updatedState = [...products];
      updatedState[productIdx].quantity -= 1;

      if (updatedState[productIdx].quantity <= 0) {
        updatedState.splice(productIdx, 1);
      }

      setProducts(updatedState);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIdx = products.findIndex(self => self.id === product.id);

      if (productIdx >= 0) {
        increment(product.id);
      } else {
        const newProduct = { ...product, quantity: 1 };

        setProducts(previous => [...previous, newProduct]);
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };