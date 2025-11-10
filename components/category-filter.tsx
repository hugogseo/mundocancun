"use client"

import { Badge } from "@/components/ui/badge"
import type { Category } from "@/types/database.types"
import { motion } from "framer-motion"

interface CategoryFilterProps {
  categories: Category[]
  selected?: string[]
  onSelect?: (slug: string) => void
}

export function CategoryFilter({ categories, selected = [], onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category, index) => {
        const isSelected = selected.includes(category.slug)
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer px-6 py-2.5 text-sm font-medium hover:scale-105 transition-transform"
              onClick={() => onSelect?.(category.slug)}
            >
              {category.name}
            </Badge>
          </motion.div>
        )
      })}
    </div>
  )
}
