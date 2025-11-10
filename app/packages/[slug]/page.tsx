import { notFound } from "next/navigation"
import Image from "next/image"
import { Calendar, Users, MapPin, Star } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckoutButton } from "@/components/checkout-button"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import type { PackageWithDetails } from "@/types/database.types"

async function getPackage(slug: string): Promise<PackageWithDetails | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("pkg_packages")
    .select(`
      *,
      images:pkg_package_images(*),
      categories:pkg_package_tags(category:cat_categories(*))
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!data) return null

  return {
    ...data,
    categories: data.categories?.map((t: any) => t.category).filter(Boolean) || [],
  } as PackageWithDetails
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = await getPackage(slug)

  if (!pkg) {
    notFound()
  }

  const ctaConfig = {
    inquiry: { label: "Solicitar Información", action: "inquiry" },
    quote: { label: "Solicitar Cotización", action: "quote" },
    instant: { label: "Reservar Ahora", action: "payment" },
    payment: { label: "Reservar Ahora", action: "payment" },
  }

  const cta = ctaConfig[pkg.booking_mode as keyof typeof ctaConfig] || ctaConfig.inquiry

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        {/* Hero Image */}
        <div className="relative h-[60vh]">
          <Image
            src={pkg.cover_url || `https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80`}
            alt={pkg.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10 pb-20">
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {pkg.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {pkg.title}
              </h1>

              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{pkg.duration_nights} noches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{pkg.min_guests} - {pkg.max_guests} personas</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-sm text-muted-foreground">Desde</span>
                <span className="text-4xl font-bold">{formatCurrency(pkg.price_base, pkg.currency)}</span>
                <span className="text-muted-foreground">por persona</span>
              </div>

              {pkg.booking_mode === "payment" ? (
                <CheckoutButton package={pkg} />
              ) : (
                <Button size="lg" className="w-full md:w-auto">
                  {cta.label}
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {pkg.long_description || pkg.short_description}
                  </p>
                </div>
              </section>

              {pkg.images && pkg.images.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Galería</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {pkg.images.map((image) => (
                      <div key={image.id} className="relative h-64 rounded-xl overflow-hidden">
                        <Image
                          src={image.image_url}
                          alt={pkg.title}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Incluye</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Hospedaje {pkg.duration_nights} noches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Desayunos incluidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Traslados aeropuerto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Seguro de viaje</span>
                    </li>
                  </ul>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      ¿Necesitas ayuda para elegir?
                    </p>
                    <Button variant="outline" className="w-full">
                      Contactar Asesor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
