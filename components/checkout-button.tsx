"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Users, CreditCard, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import type { Package } from "@/types/database.types"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutButtonProps {
  package: Package
}

export function CheckoutButton({ package: pkg }: CheckoutButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkin: "",
    checkout: "",
    guests: pkg.min_guests.toString(),
  })

  const calculateAmount = () => {
    const guests = parseInt(formData.guests)
    // Simple calculation: base price per guest
    return pkg.price_base * guests
  }

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login
        router.push("/login?redirect=/packages/" + pkg.slug)
        return
      }

      const amount = calculateAmount()

      // Call checkout API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: pkg.id,
          checkin: formData.checkin,
          checkout: formData.checkout,
          guests: parseInt(formData.guests),
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el checkout")
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe no está disponible")
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      alert("Error al procesar el pago: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.checkin && formData.checkout && formData.guests

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full gap-2">
          <CreditCard className="h-5 w-5" />
          Reservar Ahora
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Paquete</DialogTitle>
          <DialogDescription>
            Completa los datos de tu reserva para proceder al pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="checkin" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Check-in
            </Label>
            <Input
              id="checkin"
              type="date"
              value={formData.checkin}
              onChange={(e) => setFormData({ ...formData, checkin: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Check-out
            </Label>
            <Input
              id="checkout"
              type="date"
              value={formData.checkout}
              onChange={(e) => setFormData({ ...formData, checkout: e.target.value })}
              min={formData.checkin || new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Número de Huéspedes
            </Label>
            <Input
              id="guests"
              type="number"
              min={pkg.min_guests}
              max={pkg.max_guests}
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: {pkg.min_guests}, Máximo: {pkg.max_guests}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Precio base</span>
              <span className="text-sm">{formatCurrency(pkg.price_base)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Huéspedes</span>
              <span className="text-sm">x {formData.guests}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-bold">Total a pagar</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculateAmount())}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={!isFormValid || loading}
            className="flex-1 gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Proceder al Pago
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Serás redirigido a Stripe para completar el pago de forma segura
        </p>
      </DialogContent>
    </Dialog>
  )
}
