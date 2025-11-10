"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { uploadPackageImage } from "@/lib/storage"
import { slugify } from "@/lib/utils"
import { Upload, X, Loader2 } from "lucide-react"
import type { Category } from "@/types/database.types"

export default function NewPackagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    destination: "",
    short_description: "",
    long_description: "",
    price_base: "",
    duration_nights: "",
    min_guests: "1",
    max_guests: "10",
    status: "draft" as "draft" | "published" | "archived",
    booking_mode: "inquiry" as "inquiry" | "quote" | "payment",
  })

  // Load categories on mount
  useState(() => {
    const loadCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("cat_categories").select("*").order("name")
      if (data) setCategories(data)
    }
    loadCategories()
  })

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: slugify(title),
    })
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalImages([...additionalImages, ...files])
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Upload cover image
      let coverUrl = ""
      if (coverFile) {
        coverUrl = await uploadPackageImage(coverFile, formData.slug)
      }

      // Create package
      const { data: pkg, error: pkgError } = await supabase
        .from("pkg_packages")
        .insert({
          ...formData,
          price_base: parseFloat(formData.price_base),
          duration_nights: parseInt(formData.duration_nights),
          min_guests: parseInt(formData.min_guests),
          max_guests: parseInt(formData.max_guests),
          cover_url: coverUrl,
        })
        .select()
        .single()

      if (pkgError) throw pkgError

      // Upload additional images
      if (additionalImages.length > 0) {
        const imageUploads = await Promise.all(
          additionalImages.map(async (file, index) => {
            const url = await uploadPackageImage(file, `${formData.slug}-${index}`)
            return {
              package_id: pkg.id,
              image_url: url,
              sort_order: index,
            }
          })
        )

        await supabase.from("pkg_package_images").insert(imageUploads)
      }

      // Assign categories
      if (selectedCategories.length > 0) {
        const tags = selectedCategories.map(catId => ({
          package_id: pkg.id,
          category_id: catId,
        }))
        await supabase.from("pkg_package_tags").insert(tags)
      }

      router.push("/admin/packages")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating package:", error)
      alert("Error al crear el paquete: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nuevo Paquete</h1>
        <p className="text-muted-foreground">Crea un nuevo paquete turístico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej: Paraíso Todo Incluido en Cancún"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="paraiso-todo-incluido-cancun"
              />
              <p className="text-xs text-muted-foreground">Se genera automáticamente desde el título</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destino *</Label>
              <Input
                id="destination"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Cancún, Quintana Roo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Descripción Corta</Label>
              <Textarea
                id="short_description"
                rows={2}
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="5 días y 4 noches en resort de lujo..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description">Descripción Larga</Label>
              <Textarea
                id="long_description"
                rows={6}
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                placeholder="Disfruta de una experiencia inolvidable..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Precio y Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price_base">Precio Base (MXN) *</Label>
                <Input
                  id="price_base"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_base}
                  onChange={(e) => setFormData({ ...formData, price_base: e.target.value })}
                  placeholder="25000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_nights">Noches *</Label>
                <Input
                  id="duration_nights"
                  type="number"
                  required
                  value={formData.duration_nights}
                  onChange={(e) => setFormData({ ...formData, duration_nights: e.target.value })}
                  placeholder="4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_guests">Huéspedes Mínimo</Label>
                <Input
                  id="min_guests"
                  type="number"
                  value={formData.min_guests}
                  onChange={(e) => setFormData({ ...formData, min_guests: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_guests">Huéspedes Máximo</Label>
                <Input
                  id="max_guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y Modo de Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_mode">Modo de Reserva</Label>
                <Select value={formData.booking_mode} onValueChange={(value: any) => setFormData({ ...formData, booking_mode: value })}>
                  <SelectTrigger id="booking_mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquiry">Solo Información (inquiry)</SelectItem>
                    <SelectItem value="quote">Cotización (quote)</SelectItem>
                    <SelectItem value="payment">Pago Directo (payment)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.booking_mode === "inquiry" && "Usuarios solo solicitan información"}
                  {formData.booking_mode === "quote" && "Usuarios solicitan cotización personalizada"}
                  {formData.booking_mode === "payment" && "Usuarios pueden pagar directamente con Stripe"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="cursor-pointer">
                    <Badge variant={selectedCategories.includes(category.id) ? "default" : "outline"}>
                      {category.name}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover">Imagen de Portada</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="flex-1"
                />
                {coverPreview && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional">Imágenes Adicionales</Label>
              <Input
                id="additional"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
              />
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {additionalImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Paquete
          </Button>
        </div>
      </form>
    </div>
  )
}
