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
import { uploadPackageImage, deletePackageImage } from "@/lib/storage"
import { X, Loader2 } from "lucide-react"
import type { PackageWithDetails, Category } from "@/types/database.types"

interface PackageEditFormProps {
  packageData: PackageWithDetails
  categories: Category[]
}

export function PackageEditForm({ packageData, categories }: PackageEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(packageData.cover_url || "")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState(packageData.images || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    packageData.categories.map(c => c.id)
  )

  const [formData, setFormData] = useState({
    title: packageData.title,
    slug: packageData.slug,
    destination: packageData.destination,
    short_description: packageData.short_description || "",
    long_description: packageData.long_description || "",
    price_base: packageData.price_base.toString(),
    duration_nights: packageData.duration_nights.toString(),
    min_guests: packageData.min_guests.toString(),
    max_guests: packageData.max_guests.toString(),
    status: packageData.status,
    booking_mode: packageData.booking_mode,
  })

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

  const removeExistingImage = async (imageId: string, imageUrl: string) => {
    if (confirm("¿Eliminar esta imagen?")) {
      try {
        const supabase = createClient()
        await supabase.from("pkg_package_images").delete().eq("id", imageId)
        await deletePackageImage(imageUrl)
        setExistingImages(existingImages.filter(img => img.id !== imageId))
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    }
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

      // Upload new cover if changed
      let coverUrl = coverPreview
      if (coverFile) {
        // Delete old cover if exists
        if (packageData.cover_url) {
          await deletePackageImage(packageData.cover_url)
        }
        coverUrl = await uploadPackageImage(coverFile, formData.slug)
      }

      // Update package
      const { error: updateError } = await supabase
        .from("pkg_packages")
        .update({
          ...formData,
          price_base: parseFloat(formData.price_base),
          duration_nights: parseInt(formData.duration_nights),
          min_guests: parseInt(formData.min_guests),
          max_guests: parseInt(formData.max_guests),
          cover_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", packageData.id)

      if (updateError) throw updateError

      // Upload new additional images
      if (additionalImages.length > 0) {
        const imageUploads = await Promise.all(
          additionalImages.map(async (file, index) => {
            const url = await uploadPackageImage(file, `${formData.slug}-${Date.now()}-${index}`)
            return {
              package_id: packageData.id,
              image_url: url,
              sort_order: existingImages.length + index,
            }
          })
        )

        await supabase.from("pkg_package_images").insert(imageUploads)
      }

      // Update categories
      // Delete existing tags
      await supabase.from("pkg_package_tags").delete().eq("package_id", packageData.id)

      // Insert new tags
      if (selectedCategories.length > 0) {
        const tags = selectedCategories.map(catId => ({
          package_id: packageData.id,
          category_id: catId,
        }))
        await supabase.from("pkg_package_tags").insert(tags)
      }

      router.push("/admin/packages")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating package:", error)
      alert("Error al actualizar el paquete: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este paquete? Esta acción no se puede deshacer.")) {
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Delete images from storage
      if (packageData.cover_url) {
        await deletePackageImage(packageData.cover_url)
      }
      for (const img of existingImages) {
        await deletePackageImage(img.image_url)
      }

      // Delete package (cascades to images and tags due to FK constraints)
      await supabase.from("pkg_packages").delete().eq("id", packageData.id)

      router.push("/admin/packages")
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting package:", error)
      alert("Error al eliminar el paquete: " + error.message)
      setLoading(false)
    }
  }

  return (
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destino *</Label>
            <Input
              id="destination"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripción Corta</Label>
            <Textarea
              id="short_description"
              rows={2}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Descripción Larga</Label>
            <Textarea
              id="long_description"
              rows={6}
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
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
                  <SelectItem value="inquiry">Solo Información</SelectItem>
                  <SelectItem value="quote">Cotización</SelectItem>
                  <SelectItem value="payment">Pago Directo</SelectItem>
                </SelectContent>
              </Select>
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
            <Label>Imágenes Existentes</Label>
            <div className="grid grid-cols-4 gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.image_url}
                    alt="Existing"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id, img.image_url)}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Añadir Imágenes</Label>
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
                      alt={`New ${index + 1}`}
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
      <div className="flex justify-between">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Eliminar Paquete
        </Button>

        <div className="flex gap-4">
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
            Guardar Cambios
          </Button>
        </div>
      </div>
    </form>
  )
}
