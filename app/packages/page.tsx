import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryFilter } from "@/components/category-filter"
import { PackageCardEnhanced } from "@/components/package-card-enhanced"
import { createClient } from "@/lib/supabase/server"
import type { PackageWithDetails } from "@/types/database.types"

async function getPackages(searchParams: { [key: string]: string | undefined }) {
  const supabase = await createClient()

  let query = supabase
    .from("pkg_packages")
    .select(`
      *,
      images:pkg_package_images(*),
      categories:pkg_package_tags(category:cat_categories(*))
    `)
    .eq("status", "published")

  // Apply filters
  if (searchParams.budget) {
    const [min, max] = searchParams.budget.split("-")
    if (max === "+") {
      query = query.gte("price_base", parseInt(min))
    } else {
      query = query.gte("price_base", parseInt(min)).lte("price_base", parseInt(max))
    }
  }

  if (searchParams.guests) {
    query = query.lte("min_guests", parseInt(searchParams.guests))
  }

  const { data } = await query.order("created_at", { ascending: false })

  const packages = (data || []).map((pkg) => ({
    ...pkg,
    categories: pkg.categories?.map((t: any) => t.category).filter(Boolean) || [],
  })) as PackageWithDetails[]

  // Filter by category if specified
  if (searchParams.category) {
    return packages.filter((pkg) =>
      pkg.categories.some((cat) => cat.slug === searchParams.category)
    )
  }

  return packages
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from("cat_categories").select("*").order("name")
  return data || []
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const [packages, categories] = await Promise.all([
    getPackages(params),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl font-bold mb-4">Nuestros Paquetes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra el viaje perfecto para ti
            </p>
          </div>

          <div className="mb-12">
            <CategoryFilter categories={categories} />
          </div>

          <Suspense fallback={<div>Cargando paquetes...</div>}>
            {packages.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  No se encontraron paquetes con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg, index) => (
                  <PackageCardEnhanced key={pkg.id} package={pkg} index={index} />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
