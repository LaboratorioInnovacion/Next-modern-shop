'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { calculateCartTotals } from '@/lib/utils';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload || [] };
    case 'ADD_TO_CART':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: Math.max(1, action.payload.quantity) } : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
  const updateQuantity = async (productId, quantity) => {
    try {
      // Actualiza en el backend (puedes adaptar el endpoint si lo necesitas)
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      // Actualiza en el estado local
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Cargar el carrito desde la API al iniciar
  // Cargar carrito desde localStorage y API al iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        let merged = [];
        if (typeof window !== 'undefined') {
          const savedCart = localStorage.getItem('modernshop-cart');
          if (savedCart) {
            try {
              merged = JSON.parse(savedCart);
              dispatch({ type: 'LOAD_CART', payload: merged });
            } catch (e) { /* ignore */ }
          }
        }
        // Sincroniza con la API solo si responde 200
        const res = await fetch('/api/cart');
        if (res.status === 401) {
          // No autenticado, NO sobrescribas el carrito local
          return;
        }
        if (!res.ok) return;
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) {
          // Si la API responde vacío, pero hay carrito local, no sobrescribas
          return;
        }
        const productsRes = await fetch('/api/products');
        const products = await productsRes.json();
        merged = items.map(item => {
          const prod = products.find(p => p.id === item.productId);
          return prod ? { ...prod, quantity: item.quantity } : null;
        }).filter(Boolean);
        dispatch({ type: 'LOAD_CART', payload: merged });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('modernshop-cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = async (product, quantity = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (res.ok) {
        // Actualiza el estado local con el producto completo y cantidad
        dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify({ id: cartItemId })
      });

      if (res.ok) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const getTotalItems = () => state.items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => calculateCartTotals(state.items).total;

  // ---
  // Mover updateQuantity aquí para que esté definida antes del return
  const updateQuantity = async (productId, quantity) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
