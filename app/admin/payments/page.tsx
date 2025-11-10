import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, CreditCard } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getPayments() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("payments")
    .select(`
      *,
      booking:bookings(
        *,
        package:pkg_packages(title, slug),
        user:profiles(full_name)
      )
    `)
    .order("created_at", { ascending: false })

  return data || []
}

export default async function PaymentsPage() {
  const payments = await getPayments()

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    succeeded: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  }

  const totalRevenue = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pagos</h1>
        <p className="text-muted-foreground">
          Gestiona todos los pagos procesados con Stripe
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exitosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "succeeded").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fallidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter((p) => p.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      Pago #{payment.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={statusColor[payment.status]}>
                      {payment.status === "pending" && "Pendiente"}
                      {payment.status === "succeeded" && "Exitoso"}
                      {payment.status === "failed" && "Fallido"}
                      {payment.status === "refunded" && "Reembolsado"}
                    </Badge>
                  </div>

                  {payment.booking && (
                    <>
                      <p className="text-sm font-medium">
                        {((payment.booking as any).package as any)?.title || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {((payment.booking as any).user as any)?.full_name || "N/A"}
                      </p>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    Creado: {formatDate(payment.created_at)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                {payment.stripe_session_id && (
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground">Session ID</div>
                    <div className="font-mono text-xs break-all">
                      {payment.stripe_session_id}
                    </div>
                  </div>
                )}

                {payment.stripe_payment_intent_id && (
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground">Payment Intent ID</div>
                    <div className="font-mono text-xs break-all">
                      {payment.stripe_payment_intent_id}
                    </div>
                  </div>
                )}
              </div>

              {payment.raw && (
                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <p className="text-xs font-medium mb-2">Datos de Stripe:</p>
                  <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {JSON.stringify(payment.raw, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                {payment.stripe_session_id && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${payment.stripe_session_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver en Stripe <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                )}
                {payment.booking_id && (
                  <Button size="sm" variant="outline">
                    Ver Reserva
                  </Button>
                )}
                {payment.status === "succeeded" && (
                  <Button size="sm" variant="destructive">
                    Reembolsar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {payments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay pagos registrados aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
