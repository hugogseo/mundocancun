import { createServiceClient } from "@/lib/supabase/service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, DollarSign } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getBookings() {
  const supabase = createServiceClient()

  // Primero intentar obtener solo las reservas sin relaciones
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', JSON.stringify(error, null, 2))
    return []
  }

  console.log('Bookings fetched successfully:', data?.length || 0)
  return data || []
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona todas las reservas de paquetes turísticos
        </p>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">
                      Reserva #{booking.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={statusColor[booking.status]}>
                      {booking.status === "pending" && "Pendiente"}
                      {booking.status === "confirmed" && "Confirmada"}
                      {booking.status === "cancelled" && "Cancelada"}
                      {booking.status === "completed" && "Completada"}
                    </Badge>
                  </div>

                  <p className="text-sm font-medium">
                    Paquete ID: {booking.package_id?.slice(0, 8)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Usuario ID: {booking.user_id?.slice(0, 8) || "N/A"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Creada: {formatDate(booking.created_at)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(booking.amount, booking.currency)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Check-in</div>
                    <div className="text-muted-foreground">{formatDate(booking.checkin)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Check-out</div>
                    <div className="text-muted-foreground">{formatDate(booking.checkout)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Huéspedes</div>
                    <div className="text-muted-foreground">{booking.guests}</div>
                  </div>
                </div>
              </div>

              {booking.metadata && (
                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <p className="text-xs font-medium mb-2">Metadata:</p>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(booking.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm">Ver Detalles</Button>
                {booking.status === "pending" && (
                  <Button size="sm" variant="default">
                    Confirmar Reserva
                  </Button>
                )}
                {booking.status !== "cancelled" && (
                  <Button size="sm" variant="destructive">
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {bookings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay reservas aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
