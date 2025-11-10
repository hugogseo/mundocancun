import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, DollarSign, Users } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getInquiries() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("lead_inquiries")
    .select(`
      *,
      package:pkg_packages(title, slug)
    `)
    .order("created_at", { ascending: false })

  return data || []
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Consultas de Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona las consultas e intereses de clientes potenciales
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {inquiry.full_name}
                    <Badge variant="outline">{inquiry.source}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(inquiry.created_at)}
                  </p>
                </div>
                {inquiry.package && (
                  <Badge>{(inquiry.package as any).title}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${inquiry.email}`} className="text-sm hover:underline">
                    {inquiry.email}
                  </a>
                </div>

                {inquiry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${inquiry.phone}`} className="text-sm hover:underline">
                      {inquiry.phone}
                    </a>
                  </div>
                )}

                {inquiry.guests && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{inquiry.guests} huéspedes</span>
                  </div>
                )}

                {inquiry.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatCurrency(inquiry.budget)}</span>
                  </div>
                )}
              </div>

              {inquiry.dates && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{inquiry.dates}</span>
                </div>
              )}

              {inquiry.notes && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Notas:</p>
                  <p className="text-sm">{inquiry.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <a href={`mailto:${inquiry.email}`}>Responder</a>
                </Button>
                <Button size="sm" variant="outline">
                  Crear Cotización
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {inquiries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay consultas aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
