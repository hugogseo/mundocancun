"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { PackageWithDetails } from "@/types/database.types"
import { motion } from "framer-motion"

interface PackageCardProps {
  package: PackageWithDetails
  index?: number
}

export function PackageCard({ package: pkg, index = 0 }: PackageCardProps) {
  const ctaConfig = {
    inquiry: { label: "Más info", variant: "outline" as const },
    quote: { label: "Cotizar", variant: "secondary" as const },
    payment: { label: "Reservar", variant: "default" as const },
  }

  const cta = ctaConfig[pkg.booking_mode]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border-slate-100">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={pkg.cover_url || `https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80`}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4 flex gap-2">
            {pkg.categories.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="secondary" className="backdrop-blur-md bg-white/95 rounded-lg shadow-sm">
                {cat.name}
              </Badge>
            ))}
          </div>
          {pkg.booking_mode === 'payment' && (
            <div className="absolute top-4 right-4">
              <Badge className="backdrop-blur-md bg-primary/95 rounded-lg shadow-sm">
                Pago Online
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {pkg.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <MapPin className="h-4 w-4" />
                <span>{pkg.destination}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {pkg.short_description || "Experiencia inolvidable en el paraíso caribeño"}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{pkg.duration_nights} noches</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Hasta {pkg.max_guests}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Desde</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(pkg.price_base, pkg.currency)}</span>
            <span className="text-sm text-muted-foreground">MXN</span>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button asChild variant={cta.variant} className="w-full h-11 rounded-xl shadow-sm hover:shadow-md transition-all">
            <Link href={`/packages/${pkg.slug}`}>
              {cta.label}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
