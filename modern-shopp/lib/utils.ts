import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// lib/utils.js

export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(price);
};

export const calculateCartTotals = (items) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // const tax = subtotal * 0.21; // 21% IVA
  const tax = 0; // 21% IVA
  // const shipping = subtotal > 20000 ? 0 : 1500;
  const shipping = 0;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
};
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-AR', options);
};