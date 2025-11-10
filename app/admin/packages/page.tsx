import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

async function getPackages() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("pkg_packages")
    .select("*")
    .order("created_at", { ascending: false })

  return data || []
}

export default async function AdminPackagesPage() {
  const packages = await getPackages()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Paquetes</h1>
        <Button asChild>
          <Link href="/admin/packages/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paquete
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Paquetes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{pkg.title}</h3>
                    <Badge variant={pkg.status === "published" ? "default" : "secondary"}>
                      {pkg.status}
                    </Badge>
                    <Badge variant="outline">{pkg.booking_mode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pkg.destination} • {pkg.duration_nights} noches • {formatCurrency(pkg.price_base)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/packages/${pkg.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {packages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay paquetes creados aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
