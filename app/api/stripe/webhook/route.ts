import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServiceClient } from "@/lib/supabase/service"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const supabase = createServiceClient()

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id

        if (!bookingId) {
          console.error("No booking_id in session metadata")
          break
        }

        // Update payment status to "succeeded"
        const { error: paymentError } = await (supabase
          .from("payments")
          .update as any)({
            status: "succeeded",
            stripe_payment_intent_id: session.payment_intent as string,
            raw: session as any,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id)

        if (paymentError) {
          console.error("Error updating payment:", paymentError)
        }

        // Update booking status to "confirmed" (paid)
        const { error: bookingError } = await (supabase
          .from("bookings")
          .update as any)({
            status: "confirmed",
            metadata: {
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId)

        if (bookingError) {
          console.error("Error updating booking:", bookingError)
        }

        console.log(`Payment succeeded for booking ${bookingId}`)
        console.log(`Booking status updated to "confirmed" (paid)`)
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session

        await (supabase
          .from("payments")
          .update as any)({
            status: "failed",
            raw: session as any,
          })
          .eq("stripe_session_id", session.id)

        console.log(`Session expired: ${session.id}`)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge

        await (supabase
          .from("payments")
          .update as any)({
            status: "refunded",
            raw: charge as any,
          })
          .eq("stripe_payment_intent_id", charge.payment_intent as string)

        console.log(`Charge refunded: ${charge.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    )
  }
}
