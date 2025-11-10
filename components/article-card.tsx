'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface ArticleCardProps {
  title: string
  subtitle?: string
  image: string
  href: string
  index?: number
}

export function ArticleCard({ title, subtitle, image, href, index = 0 }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={href}>
        <div className="group relative h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            {subtitle && (
              <p className="text-sm font-semibold tracking-wider mb-2 text-sky-300">
                {subtitle}
              </p>
            )}
            <h3 className="text-3xl font-bold mb-4 leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-4 transition-all">
              <span>Leer más</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
