"use client"

import { useState } from "react"
import { Calendar, DollarSign, Users, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

export function SearchForm() {
  const [searchData, setSearchData] = useState({
    location: "",
    dates: "",
    budget: "",
    guests: "2",
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic - navigate to /packages with query params
    const params = new URLSearchParams({
      ...(searchData.budget && { budget: searchData.budget }),
      guests: searchData.guests,
    })
    window.location.href = `/packages?${params.toString()}`
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 grid gap-6 md:gap-8 md:grid-cols-4 max-w-6xl mx-auto"
    >
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MapPin className="h-4 w-4 text-sky-500" />
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="¿A dónde quieres ir?"
          value={searchData.location}
          onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
          className="h-12 rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dates" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Calendar className="h-4 w-4 text-sky-500" />
          Date Range
        </Label>
        <Input
          id="dates"
          type="text"
          placeholder="Seleccionar fechas"
          value={searchData.dates}
          onChange={(e) => setSearchData({ ...searchData, dates: e.target.value })}
          className="h-12 rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <DollarSign className="h-4 w-4 text-sky-500" />
          Budget
        </Label>
        <Select value={searchData.budget} onValueChange={(value) => setSearchData({ ...searchData, budget: value })}>
          <SelectTrigger id="budget" className="h-12 rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500">
            <SelectValue placeholder="Seleccionar presupuesto" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="10000-20000" className="rounded-lg">$10,000 - $20,000</SelectItem>
            <SelectItem value="20000-40000" className="rounded-lg">$20,000 - $40,000</SelectItem>
            <SelectItem value="40000-60000" className="rounded-lg">$40,000 - $60,000</SelectItem>
            <SelectItem value="60000+" className="rounded-lg">$60,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guests" className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Users className="h-4 w-4 text-sky-500" />
          Guest
        </Label>
        <Select value={searchData.guests} onValueChange={(value) => setSearchData({ ...searchData, guests: value })}>
          <SelectTrigger id="guests" className="h-12 rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1" className="rounded-lg">1 persona</SelectItem>
            <SelectItem value="2" className="rounded-lg">2 personas</SelectItem>
            <SelectItem value="3" className="rounded-lg">3 personas</SelectItem>
            <SelectItem value="4" className="rounded-lg">4 personas</SelectItem>
            <SelectItem value="5" className="rounded-lg">5+ personas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button type="submit" size="lg" className="w-full h-12 gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl transition-all duration-300">
          <Search className="h-5 w-5" />
          Search
        </Button>
      </div>
    </motion.form>
  )
}
