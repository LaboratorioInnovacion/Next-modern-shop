import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { ProductProvider } from "@/contexts/product-context"
import { AuthProvider } from "@/contexts/auth-context"
import { CheckoutProvider } from "@/contexts/checkout-context"
import { ToastProvider } from "@/contexts/toast-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { CouponProvider } from "@/contexts/coupon-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import SupportChat from "@/components/support-chat"

export const metadata = {
  title: "ModernShop - Tu tienda online premium",
  description:
    "Descubre productos de calidad premium con la mejor experiencia de compra online. Envío gratis, devoluciones fáciles y atención al cliente 24/7.",
  keywords: "tienda online, productos premium, tecnología, moda, hogar, deportes",
  authors: [{ name: "ModernShop Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1e293b",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <ProductProvider>
                    <CheckoutProvider>
                      <CouponProvider>
                        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                          <Header />
                          <main className="flex-grow">{children}</main>
                          <Footer />
                          <SupportChat />
                        </div>
                      </CouponProvider>
                    </CheckoutProvider>
                  </ProductProvider>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
