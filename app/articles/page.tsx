import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User } from "lucide-react"

// Mock articles - replace with Supabase query
const articles = [
  {
    id: "1",
    title: "Las 10 mejores playas de la Riviera Maya",
    slug: "mejores-playas-riviera-maya",
    excerpt: "Descubre las playas más impresionantes del Caribe Mexicano",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    category: "Destinos",
    author: "María García",
    publishedAt: "2025-01-15",
  },
  {
    id: "2",
    title: "Guía completa para visitar Chichén Itzá",
    slug: "guia-chichen-itza",
    excerpt: "Todo lo que necesitas saber antes de visitar esta maravilla del mundo",
    coverImage: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
    category: "Cultura",
    author: "Carlos Ruiz",
    publishedAt: "2025-01-10",
  },
  {
    id: "3",
    title: "Consejos para bucear en Cozumel",
    slug: "buceo-cozumel",
    excerpt: "Los mejores spots de buceo y consejos para principiantes",
    coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    category: "Actividades",
    author: "Ana Martínez",
    publishedAt: "2025-01-05",
  },
]

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl font-bold mb-4">Blog de Viajes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Consejos, guías y experiencias del Caribe Mexicano
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative h-48">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                        {article.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(article.publishedAt).toLocaleDateString("es-MX")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
