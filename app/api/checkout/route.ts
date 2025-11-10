import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, checkin, checkout, guests, amount } = body

    // Validate required fields
    if (!packageId || !checkin || !checkout || !guests || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: packageId, checkin, checkout, guests, amount" },
        { status: 400 }
      )
    }

    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from("pkg_packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Verify package allows payment mode
    if (pkg.booking_mode !== "payment") {
      return NextResponse.json(
        { error: "This package does not support direct payment" },
        { status: 400 }
      )
    }

    // Create booking with status "created"
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        package_id: packageId,
        user_id: user.id,
        checkin,
        checkout,
        guests,
        amount,
        currency: "MXN",
        status: "pending",
        metadata: {
          created_from: "checkout_flow",
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Failed to create booking: " + bookingError?.message },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "mxn",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: pkg.title,
              description: pkg.short_description || `${guests} huéspedes, ${checkout.split('T')[0]} - ${checkin.split('T')[0]}`,
              images: pkg.cover_url ? [pkg.cover_url] : [],
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        package_id: packageId,
        user_id: user.id,
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/packages/${pkg.slug}?canceled=true`,
    })

    // Create payment record
    await supabase.from("payments").insert({
      booking_id: booking.id,
      stripe_session_id: session.id,
      amount: amount,
      currency: "MXN",
      status: "pending",
      raw: session as any,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      bookingId: booking.id
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
