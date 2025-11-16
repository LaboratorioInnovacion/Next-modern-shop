"use client";

import Hero from "@/components/hero";
import ProductosSlider from "@/components/productos-slider";
import Features from "@/components/features";
import FeaturedProducts from "@/components/featured-products";
import Categories from "@/components/categories";
import Newsletter from "@/components/newsletter";

export default function Home() {
  return (
    <>
      <Hero />  
      <ProductosSlider />
      <Features />
      <FeaturedProducts />
      <Categories />
      <Newsletter />
    </>
  );
}
