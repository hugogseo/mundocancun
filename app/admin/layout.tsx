import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Home, Package, Users, DollarSign, MessageSquare, FileText } from "lucide-react"

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin or editor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    redirect("/")
  }

  return { user, profile }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getUser()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/packages", label: "Paquetes", icon: Package },
    { href: "/admin/inquiries", label: "Consultas", icon: MessageSquare },
    { href: "/admin/quotes", label: "Cotizaciones", icon: FileText },
    { href: "/admin/bookings", label: "Reservas", icon: Users },
    { href: "/admin/payments", label: "Pagos", icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl font-bold text-primary">
            Admin - Mundo Cancún
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Ver sitio público
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
