import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PackageEditForm } from "./edit-form"

async function getPackageWithDetails(id: string) {
  const supabase = await createClient()

  const { data: pkg, error } = await supabase
    .from("pkg_packages")
    .select(`
      *,
      images:pkg_package_images(*),
      categories:pkg_package_tags(category:cat_categories(*))
    `)
    .eq("id", id)
    .single()

  if (error || !pkg) {
    return null
  }

  return {
    ...pkg,
    categories: pkg.categories?.map((t: any) => t.category).filter(Boolean) || [],
  }
}

async function getAllCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from("cat_categories").select("*").order("name")
  return data || []
}

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [pkg, categories] = await Promise.all([
    getPackageWithDetails(id),
    getAllCategories(),
  ])

  if (!pkg) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Editar Paquete</h1>
        <p className="text-muted-foreground">{pkg.title}</p>
      </div>

      <PackageEditForm packageData={pkg} categories={categories} />
    </div>
  )
}
