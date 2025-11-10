import Image from "next/image"
import Link from "next/link"
import { Shield, Settings, Users as UsersIcon, CheckCircle2, Award, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchForm } from "@/components/search-form"
import { DestinationCard } from "@/components/destination-card"
import { PackageCardEnhanced } from "@/components/package-card-enhanced"
import { ArticleCard } from "@/components/article-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { PackageWithDetails } from "@/types/database.types"

async function getHomeData() {
  const supabase = await createClient()

  const packagesResult = await supabase
    .from("pkg_packages")
    .select(`
      *,
      images:pkg_package_images(*),
      categories:pkg_package_tags(category:cat_categories(*))
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3)

  const packages = (packagesResult.data || []).map((pkg) => ({
    ...pkg,
    categories: pkg.categories?.map((t: any) => t.category).filter(Boolean) || [],
  })) as PackageWithDetails[]

  return { packages }
}

export default async function HomePage() {
  const { packages } = await getHomeData()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80"
          alt="Tropical Paradise"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white mb-8 md:mb-12">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 tracking-tight">
              Explore The World
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl mx-auto font-light">
              What are you waiting for? It's time to make an Experience
            </p>
          </div>

          <SearchForm />
        </div>
      </section>

      {/* Explore Beautiful Places Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Explore beautiful places now
            </h2>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            <DestinationCard
              title="Travel to Maldives"
              image="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80"
              href="/packages?destination=maldives"
              price="$2,340"
              index={0}
            />
            <DestinationCard
              title="Travel to Singapore"
              image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80"
              href="/packages?destination=singapore"
              price="$1,870"
              index={1}
            />
            <DestinationCard
              title="Travel to South Korea"
              image="https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80"
              href="/packages?destination=korea"
              price="$2,100"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <p className="text-sky-500 font-semibold mb-4 tracking-wider text-sm uppercase">WHY CHOOSE US</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              We ensure that your travel process is perfectly accommodated.
            </h2>
          </div>

          <div className="grid gap-8 md:gap-10 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Award,
                title: "Best travel provider",
                description: "We are the leading agency for family travel with exclusive packages and unbeatable prices.",
              },
              {
                icon: Settings,
                title: "Personalised Service",
                description: "Tailored itineraries designed specifically for you and your family's unique preferences.",
              },
              {
                icon: UsersIcon,
                title: "Experienced Agent",
                description: "Our travel experts have years of experience creating unforgettable journeys.",
              },
              {
                icon: CheckCircle2,
                title: "Trouble free",
                description: "24/7 support and comprehensive travel insurance for complete peace of mind.",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 mb-6">
                  <benefit.icon className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-4 md:gap-5 lg:gap-6 md:grid-cols-3 lg:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80", // sailboats
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", // beach hammock
              "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80", // rocky coast
              "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", // airplane wing
              "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // person jumping in water
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // mountain landscape
            ].map((src, i) => (
              <div
                key={i}
                className="relative h-64 md:h-72 lg:h-80 rounded-3xl overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <Image
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <p className="text-sky-500 font-semibold mb-4 tracking-wider text-sm uppercase">EXPLORE POPULAR PACKAGES</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              What we offer is an unforgettable journey and experience.
            </h2>

            {/* Search Bar */}
            <div className="mt-8">
              <SearchForm />
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-3 mt-16">
            {packages.map((pkg, index) => (
              <PackageCardEnhanced key={pkg.id} package={pkg} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-xl border-2 hover:bg-sky-50 hover:border-sky-500 hover:text-sky-600"
            >
              <Link href="/packages">View all packages →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sky-500 font-semibold mb-4 tracking-wider text-sm uppercase">ARTICLES</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Although a picture is worth a thousand words
            </h2>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            <ArticleCard
              title="BEST VACATION SPOTS IN AUSTRALIA"
              subtitle="AUSTRALIA"
              image="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80"
              href="/blog/australia-vacation"
              index={0}
            />
            <ArticleCard
              title="AUSTRALIA IS A WONDERLAND"
              subtitle="WONDERLAND"
              image="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80"
              href="/blog/australia-wonderland"
              index={1}
            />
            <ArticleCard
              title="NATURAL BEAUTY"
              subtitle="NATURE"
              image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
              href="/blog/natural-beauty"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80"
          alt="Contact"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/90 to-blue-700/90" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contact us for help or information
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/90">
              We're here to assist you with any questions about your travel plans
            </p>

            {/* Contact Form */}
            <form className="flex gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-14 px-6 rounded-xl bg-white/95 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-xl bg-white text-sky-600 hover:bg-white/90 font-semibold shadow-xl"
              >
                Send message
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
