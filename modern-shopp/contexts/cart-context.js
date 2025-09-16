'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './auth-context';
import { calculateCartTotals } from '@/lib/utils';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload || [] };
    case 'ADD_TO_CART':
      // Si el producto ya existe, actualiza la cantidad
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      // Si no existe, lo agrega normalmente
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
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Cargar el carrito desde la API al iniciar
  // Cargar carrito desde localStorage y API al iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated) {
          // Usuario logueado: cargar desde la API
          const res = await fetch('/api/cart');
          if (res.ok) {
            const items = await res.json();
            if (Array.isArray(items) && items.length > 0) {
              const productsRes = await fetch('/api/products');
              const products = await productsRes.json();
              const loaded = items.map(item => {
                const prod = products.find(p => p.id === item.productId);
                return prod ? { ...prod, quantity: item.quantity } : null;
              }).filter(Boolean);
              dispatch({ type: 'LOAD_CART', payload: loaded });
              // Sincroniza localStorage con el carrito del usuario
              if (typeof window !== 'undefined') {
                localStorage.setItem('modernshop-cart', JSON.stringify(loaded));
              }
              return;
            }
          }
        }
        // Usuario no logueado: cargar desde localStorage
        if (!isAuthenticated && typeof window !== 'undefined') {
          const savedCart = localStorage.getItem('modernshop-cart');
          if (savedCart) {
            try {
              const loaded = JSON.parse(savedCart);
              dispatch({ type: 'LOAD_CART', payload: loaded });
            } catch (e) { /* ignore */ }
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, [isAuthenticated]);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('modernshop-cart', JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity })
        });
        if (res.ok) {
          dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
      }
    } else {
      // No logueado: solo actualiza el estado y localStorage
      dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          body: JSON.stringify({ productId: cartItemId })
        });
        if (res.ok) {
          dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
        }
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    } else {
      dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          body: JSON.stringify({ clearAll: true })
        });
      } catch (err) {
        console.error('Error clearing cart in backend:', err);
      }
      dispatch({ type: 'CLEAR_CART' });
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  const getTotalItems = () => state.items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => calculateCartTotals(state.items).total;

  // ---
  // Mover updateQuantity aquí para que esté definida antes del return
  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ productId, quantity })
        });
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
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
