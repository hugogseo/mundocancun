import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log("🌱 Starting seed...")

  try {
    // 1. Create categories (already in schema.sql, but verify)
    const categories = [
      { slug: "resort", name: "Resort", description: "All-inclusive resort experiences", icon: "hotel" },
      { slug: "villa", name: "Villa", description: "Private villa rentals", icon: "home" },
      { slug: "island", name: "Island", description: "Island getaways", icon: "palmtree" },
      { slug: "family", name: "Family", description: "Family-friendly packages", icon: "users" },
      { slug: "luxe", name: "Luxe", description: "Luxury experiences", icon: "star" },
    ]

    console.log("Creating categories...")
    for (const cat of categories) {
      await supabase.from("cat_categories").upsert(cat, { onConflict: "slug" })
    }

    // 2. Create sample packages
    const packages = [
      {
        title: "Paraíso Todo Incluido en Cancún",
        slug: "paraiso-todo-incluido-cancun",
        destination: "Cancún, Quintana Roo",
        short_description: "5 días y 4 noches en resort de lujo con todo incluido",
        long_description: "Disfruta de una experiencia inolvidable en uno de los mejores resorts de Cancún. Incluye comidas, bebidas, acceso a playa privada, actividades acuáticas y entretenimiento nocturno. Perfecto para parejas y familias.",
        price_base: 25000,
        currency: "MXN",
        duration_nights: 4,
        min_guests: 1,
        max_guests: 4,
        cover_url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
        status: "published" as const,
        booking_mode: "payment" as const,
      },
      {
        title: "Villa Privada en Tulum",
        slug: "villa-privada-tulum",
        destination: "Tulum, Quintana Roo",
        short_description: "3 días en villa de lujo con chef privado",
        long_description: "Experimenta la exclusividad de Tulum en una villa frente al mar con chef privado, piscina infinita y acceso directo a la playa. Ideal para lunas de miel o escapadas románticas.",
        price_base: 45000,
        currency: "MXN",
        duration_nights: 3,
        min_guests: 2,
        max_guests: 6,
        cover_url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
        status: "published" as const,
        booking_mode: "quote" as const,
      },
      {
        title: "Aventura Familiar en Playa del Carmen",
        slug: "aventura-familiar-playa-carmen",
        destination: "Playa del Carmen, Quintana Roo",
        short_description: "6 días de diversión para toda la familia",
        long_description: "Paquete diseñado para familias con niños. Incluye hospedaje en resort familiar, tours a parques temáticos, snorkel en cenotes y actividades para todas las edades.",
        price_base: 18000,
        currency: "MXN",
        duration_nights: 6,
        min_guests: 2,
        max_guests: 8,
        cover_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
        status: "published" as const,
        booking_mode: "inquiry" as const,
      },
      {
        title: "Experiencia de Lujo en Isla Mujeres",
        slug: "experiencia-lujo-isla-mujeres",
        destination: "Isla Mujeres, Quintana Roo",
        short_description: "4 días en resort boutique exclusivo",
        long_description: "Descubre el paraíso en Isla Mujeres. Hospedaje en resort boutique de 5 estrellas, spa incluido, tours privados en catamarán y cenas gourmet frente al mar.",
        price_base: 35000,
        currency: "MXN",
        duration_nights: 4,
        min_guests: 2,
        max_guests: 4,
        cover_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
        status: "published" as const,
        booking_mode: "payment" as const,
      },
    ]

    console.log("Creating packages...")
    const createdPackages = []
    for (const pkg of packages) {
      const { data, error } = await supabase
        .from("pkg_packages")
        .upsert(pkg, { onConflict: "slug" })
        .select()
        .single()

      if (error) {
        console.error(`Error creating package ${pkg.slug}:`, error)
      } else {
        createdPackages.push(data)
        console.log(`✓ Created package: ${pkg.title}`)
      }
    }

    // 3. Assign categories to packages
    console.log("Assigning categories to packages...")
    const packageCategoryMap = [
      { packageSlug: "paraiso-todo-incluido-cancun", categories: ["resort", "family"] },
      { packageSlug: "villa-privada-tulum", categories: ["villa", "luxe"] },
      { packageSlug: "aventura-familiar-playa-carmen", categories: ["resort", "family"] },
      { packageSlug: "experiencia-lujo-isla-mujeres", categories: ["island", "luxe"] },
    ]

    for (const mapping of packageCategoryMap) {
      const pkg = createdPackages.find((p) => p.slug === mapping.packageSlug)
      if (!pkg) continue

      for (const catSlug of mapping.categories) {
        const { data: category } = await supabase
          .from("cat_categories")
          .select("id")
          .eq("slug", catSlug)
          .single()

        if (category) {
          await supabase.from("pkg_package_tags").upsert({
            package_id: pkg.id,
            category_id: category.id,
          })
        }
      }
    }

    console.log("✅ Seed completed successfully!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    throw error
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
