/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { PropsWithChildren } from 'react';
import toast from 'react-hot-toast';
import { cartApi } from '../api/cart.api';
import { useAuthContext } from './AuthContext';
import type { Cart, CartItem } from '../types/cart.types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'CLEAR_CART' };

interface CartContextValue extends CartState {
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    case 'CLEAR_CART':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuthContext();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cart = await cartApi.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Could not load cart.');
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const cart = await cartApi.addItem({ productId, quantity });
        dispatch({ type: 'SET_CART', payload: cart });
        toast.success('Added to cart');
      } catch {
        toast.error('Could not add item to cart.');
        throw new Error('ADD_ITEM_FAILED');
      }
    },
    [],
  );

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      const cart = await cartApi.updateItem({ itemId, quantity });
      dispatch({ type: 'SET_CART', payload: cart });
    } catch {
      toast.error('Could not update quantity.');
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const cart = await cartApi.removeItem(itemId);
      dispatch({ type: 'SET_CART', payload: cart });
      toast.success('Item removed');
    } catch {
      toast.error('Could not remove item.');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const cart = await cartApi.clear();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [fetchCart, isAuthenticated]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [state, fetchCart, addItem, updateItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};
