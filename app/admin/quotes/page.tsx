import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getQuotes() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("lead_quotes")
    .select(`
      *,
      package:pkg_packages(title, slug),
      inquiry:lead_inquiries(full_name, email, phone)
    `)
    .order("created_at", { ascending: false })

  return data || []
}

export default async function QuotesPage() {
  const quotes = await getQuotes()

  const statusVariant = {
    pending: "secondary" as const,
    sent: "default" as const,
    accepted: "default" as const,
    rejected: "destructive" as const,
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las cotizaciones enviadas a clientes
          </p>
        </div>
        <Button>Nueva Cotización</Button>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">
                      Cotización #{quote.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={statusColor[quote.status]}>
                      {quote.status === "pending" && "Pendiente"}
                      {quote.status === "sent" && "Enviada"}
                      {quote.status === "accepted" && "Aceptada"}
                      {quote.status === "rejected" && "Rechazada"}
                    </Badge>
                  </div>

                  {quote.inquiry && (
                    <div className="text-sm text-muted-foreground">
                      Cliente: {(quote.inquiry as any).full_name} - {(quote.inquiry as any).email}
                    </div>
                  )}

                  {quote.package && (
                    <div className="text-sm text-muted-foreground">
                      Paquete: {(quote.package as any).title}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-1">
                    Creada: {formatDate(quote.created_at)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(quote.price_total, quote.currency)}
                  </div>
                </div>
              </div>
            </CardHeader>

            {quote.details && (
              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  {(quote.details as any).items && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b">
                        <p className="text-sm font-semibold">Desglose de Servicios</p>
                      </div>
                      <div className="divide-y">
                        {(quote.details as any).items.map((item: any, index: number) => (
                          <div key={index} className="px-4 py-3 flex justify-between items-start">
                            <span className="text-sm">{item.description}</span>
                            <span className="text-sm font-medium ml-4">
                              {formatCurrency(item.amount, quote.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(quote.details as any).notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Notas:</p>
                      <p className="text-sm text-blue-800">{(quote.details as any).notes}</p>
                    </div>
                  )}

                  {/* Valid Until */}
                  {(quote.details as any).validUntil && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Válida hasta:</span>{' '}
                      {new Date((quote.details as any).validUntil).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm">Ver Detalles</Button>
                  {quote.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Marcar como Enviada
                    </Button>
                  )}
                  {quote.status === "sent" && (
                    <>
                      <Button size="sm" variant="default">
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline">
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {quotes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay cotizaciones aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
