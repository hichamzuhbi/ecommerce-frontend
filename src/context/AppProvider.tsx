import type { PropsWithChildren } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

export const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};
