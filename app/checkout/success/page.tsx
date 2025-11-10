import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Calendar, Users, MapPin, Mail, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  })
}

async function getCheckoutSession(sessionId: string) {
  const stripe = getStripe()
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error("Error retrieving session:", error)
    return null
  }
}

async function getBookingDetails(sessionId: string) {
  const supabase = await createClient()

  // Get payment by session ID
  const { data: payment } = await supabase
    .from("payments")
    .select(`
      *,
      booking:bookings(
        *,
        package:pkg_packages(*),
        user:profiles(full_name, email)
      )
    `)
    .eq("stripe_session_id", sessionId)
    .single()

  return payment
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect("/")
  }

  const [stripeSession, payment] = await Promise.all([
    getCheckoutSession(sessionId),
    getBookingDetails(sessionId),
  ])

  if (!stripeSession || !payment) {
    redirect("/")
  }

  const booking = (payment.booking as any)
  const pkg = booking?.package
  const user = booking?.user

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Success Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold text-green-600">¡Pago Exitoso!</h1>
              <p className="text-muted-foreground mt-1">
                Tu reserva ha sido confirmada
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Resumen de Reserva</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Número de confirmación: <span className="font-mono font-bold">{booking?.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">Confirmada</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pkg && (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Package Image */}
                  <div className="lg:col-span-1">
                    <div className="relative h-48 lg:h-full rounded-lg overflow-hidden">
                      <Image
                        src={pkg.cover_url || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80"}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{pkg.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{pkg.destination}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Check-in</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.checkin)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Check-out</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.checkout)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Huéspedes</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guests} {booking.guests === 1 ? "persona" : "personas"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.email || stripeSession.customer_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {pkg.short_description && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {pkg.short_description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-lg">Total Pagado</span>
                <span className="font-bold text-2xl text-primary">
                  {formatCurrency(payment.amount, payment.currency)}
                </span>
              </div>

              <div className="grid gap-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Método de pago</span>
                  <span className="font-medium">Tarjeta de crédito/débito</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant="default" className="bg-green-500">Pagado</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de pago</span>
                  <span className="font-medium">{formatDate(payment.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID de transacción</span>
                  <span className="font-mono text-xs">{payment.stripe_payment_intent_id || sessionId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmación por email</p>
                  <p className="text-sm text-muted-foreground">
                    Recibirás un email de confirmación en {user?.email || stripeSession.customer_email} con todos los detalles de tu reserva.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Voucher de viaje</p>
                  <p className="text-sm text-muted-foreground">
                    En las próximas 24 horas recibirás tu voucher de viaje con instrucciones detalladas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Contacto del hotel</p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo te contactará para coordinar los detalles finales de tu estadía.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                Volver al Inicio
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/packages">
                Ver Más Paquetes
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Descargar Recibo
            </Button>
          </div>

          {/* Support */}
          <Card className="bg-slate-50">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Tienes preguntas sobre tu reserva?
              </p>
              <p className="text-sm">
                Contáctanos: <a href="mailto:hola@mundocancun.com" className="text-primary hover:underline font-medium">hola@mundocancun.com</a> o <a href="tel:+529981234567" className="text-primary hover:underline font-medium">+52 998 123 4567</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
