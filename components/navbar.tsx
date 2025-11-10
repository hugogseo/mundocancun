"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Phone } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b"
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          Mundo Cancún
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/packages" className="text-sm font-medium hover:text-primary transition-colors">
            Paquetes
          </Link>
          <Link href="/articles" className="text-sm font-medium hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contacto
          </Link>
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link href="tel:+529981234567">
              <Phone className="h-4 w-4" />
              998 123 4567
            </Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </motion.nav>
  )
}
