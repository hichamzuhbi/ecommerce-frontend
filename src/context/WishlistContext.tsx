/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

const WISHLIST_KEY = 'easyshop_wishlist';

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]): void {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

interface WishlistContextValue {
  wishlist: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export const WishlistProvider = ({ children }: PropsWithChildren) => {
  const [wishlist, setWishlist] = useState<string[]>(loadFromStorage);

  const toggle = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      saveToStorage(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const value = useMemo(
    () => ({ wishlist, toggle, isWishlisted }),
    [wishlist, toggle, isWishlisted],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextValue => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
