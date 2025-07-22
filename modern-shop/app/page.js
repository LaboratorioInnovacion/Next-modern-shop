"use client"

import Hero from "@/components/hero"
import Features from "@/components/features"
import FeaturedProducts from "@/components/featured-products"
import Categories from "@/components/categories"
import Newsletter from "@/components/newsletter"

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <FeaturedProducts />
      <Categories />
      <Newsletter />
    </>
  )
}
