'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Calendar, Tag, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { PackageWithDetails } from '@/types/database.types'
import { useState } from 'react'

interface PackageCardEnhancedProps {
  package: PackageWithDetails
  index?: number
}

export function PackageCardEnhanced({ package: pkg, index = 0 }: PackageCardEnhancedProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const mainCategory = pkg.categories?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={pkg.cover_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'
              }`}
            />
          </button>

          {/* Category Badge */}
          {mainCategory && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/95 backdrop-blur-sm text-slate-800 hover:bg-white border-0 shadow-lg">
                {mainCategory.name}
              </Badge>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{pkg.destination}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-sky-600 transition-colors">
            {pkg.title}
          </h3>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{pkg.duration_nights} noches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <span>{pkg.booking_mode === 'instant' ? 'Reserva inmediata' : 'Cotización'}</span>
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Desde</p>
              <p className="text-2xl font-bold text-sky-600">
                {formatCurrency(pkg.price_base, 'MXN')}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={`/packages/${pkg.slug}`}>Ver Detalles</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
