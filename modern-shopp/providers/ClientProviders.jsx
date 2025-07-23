"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { AuthProvider } from "@/contexts/auth-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { CartProvider } from "@/contexts/cart-context";
import { ProductProvider } from "@/contexts/product-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { CouponProvider } from "@/contexts/coupon-context";

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <ProductProvider>
                  <CheckoutProvider>
                    <CouponProvider>
                      {children}
                    </CouponProvider>
                  </CheckoutProvider>
                </ProductProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
