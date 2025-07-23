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
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Cargar el carrito desde la API al iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) return;

        const data = await res.json();
        dispatch({ type: 'LOAD_CART', payload: data });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();
  }, []);

  const addToCart = async (productId) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (res.ok) {
        const item = await res.json();
        dispatch({ type: 'ADD_TO_CART', payload: item });
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

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
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

// // ✅ Archivo: context/cart-context.js
// 'use client';

// import { createContext, useContext, useReducer, useEffect } from 'react';
// import { calculateCartTotals } from '@/lib/utils';

// const CartContext = createContext();

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case 'ADD_TO_CART': {
//       const existingItem = state.items.find((item) => item.id === action.payload.id);
//       if (existingItem) {
//         return {
//           ...state,
//           items: state.items.map((item) =>
//             item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
//           )
//         };
//       }
//       return {
//         ...state,
//         items: [...state.items, { ...action.payload, quantity: 1 }]
//       };
//     }
//     case 'REMOVE_FROM_CART':
//       return {
//         ...state,
//         items: state.items.filter((item) => item.id !== action.payload)
//       };
//     case 'UPDATE_QUANTITY':
//       return {
//         ...state,
//         items: state.items
//           .map((item) =>
//             item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item
//           )
//           .filter((item) => item.quantity > 0)
//       };
//     case 'CLEAR_CART':
//       return {
//         ...state,
//         items: []
//       };
//     case 'TOGGLE_CART':
//       return {
//         ...state,
//         isOpen: !state.isOpen
//       };
//     case 'LOAD_CART':
//       return {
//         ...state,
//         items: action.payload || []
//       };
//     default:
//       return state;
//   }
// };

// export function CartProvider({ children }) {
//   const [state, dispatch] = useReducer(cartReducer, {
//     items: [],
//     isOpen: false
//   });

//   useEffect(() => {
//     const savedCart = localStorage.getItem('modernshop-cart');
//     if (savedCart) {
//       try {
//         const parsedCart = JSON.parse(savedCart);
//         dispatch({ type: 'LOAD_CART', payload: parsedCart.items || [] });
//       } catch (error) {
//         console.error('Error loading cart:', error);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('modernshop-cart', JSON.stringify(state));
//   }, [state]);

//   const addToCart = (product) => dispatch({ type: 'ADD_TO_CART', payload: product });
//   const removeFromCart = (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
//   const updateQuantity = (productId, quantity) =>
//     dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
//   const clearCart = () => dispatch({ type: 'CLEAR_CART' });
//   const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });

//   const getTotalItems = () => state.items.reduce((total, item) => total + item.quantity, 0);
//   const getTotalPrice = () => calculateCartTotals(state.items).total;

//   return (
//     <CartContext.Provider
//       value={{
//         items: state.items,
//         isOpen: state.isOpen,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         toggleCart,
//         getTotalItems,
//         getTotalPrice
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error('useCart must be used within a CartProvider');
//   return context;
// };

// // // cart-context.js
// // "use client"

// // import { createContext, useContext, useReducer, useEffect } from "react"

// // const CartContext = createContext()

// // const cartReducer = (state, action) => {
// //   switch (action.type) {
// //     case "ADD_TO_CART":
// //       const existingItem = state.items.find((item) => item.id === action.payload.id)

// //       if (existingItem) {
// //         return {
// //           ...state,
// //           items: state.items.map((item) =>
// //             item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
// //           ),
// //         }
// //       }

// //       return {
// //         ...state,
// //         items: [...state.items, { ...action.payload, quantity: 1 }],
// //       }

// //     case "REMOVE_FROM_CART":
// //       return {
// //         ...state,
// //         items: state.items.filter((item) => item.id !== action.payload),
// //       }

// //     case "UPDATE_QUANTITY":
// //       return {
// //         ...state,
// //         items: state.items
// //           .map((item) =>
// //             item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
// //           )
// //           .filter((item) => item.quantity > 0),
// //       }

// //     case "CLEAR_CART":
// //       return {
// //         ...state,
// //         items: [],
// //       }

// //     case "TOGGLE_CART":
// //       return {
// //         ...state,
// //         isOpen: !state.isOpen,
// //       }

// //     case "LOAD_CART":
// //       return {
// //         ...state,
// //         items: action.payload || [],
// //       }

// //     default:
// //       return state
// //   }
// // }

// // export function CartProvider({ children }) {
// //   const [state, dispatch] = useReducer(cartReducer, {
// //     items: [],
// //     isOpen: false,
// //   })

// //   // Cargar carrito del localStorage al iniciar
// //   useEffect(() => {
// //     if (typeof window !== "undefined") {
// //       const savedCart = localStorage.getItem("modernshop-cart")
// //       if (savedCart) {
// //         try {
// //           const parsedCart = JSON.parse(savedCart)
// //           dispatch({ type: "LOAD_CART", payload: parsedCart.items || [] })
// //         } catch (error) {
// //           console.error("Error loading cart:", error)
// //         }
// //       }
// //     }
// //   }, [])

// //   // Guardar carrito en localStorage cuando cambie
// //   useEffect(() => {
// //     if (typeof window !== "undefined") {
// //       localStorage.setItem("modernshop-cart", JSON.stringify(state))
// //     }
// //   }, [state])

// //   const addToCart = (product) => {
// //     dispatch({ type: "ADD_TO_CART", payload: product })
// //   }

// //   const removeFromCart = (productId) => {
// //     dispatch({ type: "REMOVE_FROM_CART", payload: productId })
// //   }

// //   const updateQuantity = (productId, quantity) => {
// //     dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } })
// //   }

// //   const clearCart = () => {
// //     dispatch({ type: "CLEAR_CART" })
// //   }

// //   const toggleCart = () => {
// //     dispatch({ type: "TOGGLE_CART" })
// //   }

// //   const getTotalItems = () => {
// //     return state.items.reduce((total, item) => total + item.quantity, 0)
// //   }

// //   const getTotalPrice = () => {
// //     return state.items.reduce((total, item) => {
// //       const price = Number.parseFloat(item.price.replace("$", ""))
// //       return total + price * item.quantity
// //     }, 0)
// //   }

// //   const value = {
// //     items: state.items,
// //     isOpen: state.isOpen,
// //     addToCart,
// //     removeFromCart,
// //     updateQuantity,
// //     clearCart,
// //     toggleCart,
// //     getTotalItems,
// //     getTotalPrice,
// //   }

// //   return <CartContext.Provider value={value}>{children}</CartContext.Provider>
// // }

// // export const useCart = () => {
// //   const context = useContext(CartContext)
// //   if (!context) {
// //     throw new Error("useCart must be used within a CartProvider")
// //   }
// //   return context
// // }
