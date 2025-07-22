"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/categorias", label: "Categorías" },
    { href: "/carrito", label: "Carrito" },
    { href: "/perfil", label: "Mi Perfil" },
  ]

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-gray-300 hover:text-white transition-all duration-300 font-medium relative group ${
            pathname === item.href ? "text-white" : ""
          }`}
        >
          {item.label}
          <span
            className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
              pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
            }`}
          ></span>
        </Link>
      ))}
    </nav>
  )
}
