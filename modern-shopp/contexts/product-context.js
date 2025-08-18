// ✅ Archivo: context/product-context.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
  setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const getFilteredProducts = () =>
    products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

  const getFeaturedProducts = () => products.filter((product) => product.featured);

  const getProductById = (id) => products.find((product) => product.id === id);

  // Métodos para exponer
  const filterByCategory = (categoryId) => setSelectedCategory(categoryId);
  const searchProducts = (term) => setSearchTerm(term);
  const filterByPrice = (range) => setPriceRange(range);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        searchTerm,
        selectedCategory,
        priceRange,
        getFilteredProducts,
        getFeaturedProducts,
        getProductById,
        setSearchTerm,
        setSelectedCategory,
        setPriceRange,
        filterByCategory,
        searchProducts,
        filterByPrice
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
