import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createSamplePayments() {
  console.log('💳 Creando pagos de ejemplo...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener las reservas existentes
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, amount, currency, status')
    .order('created_at', { ascending: false })

  if (bookingsError || !bookings || bookings.length === 0) {
    console.error('❌ No hay reservas disponibles. Crea reservas primero.')
    return
  }

  console.log(`📋 Encontradas ${bookings.length} reservas\n`)

  const paymentsData = [
    {
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_3QR1234567890ABC',
      stripe_session_id: 'cs_test_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0',
      raw: {
        id: 'pi_3QR1234567890ABC',
        object: 'payment_intent',
        amount: 101500,
        currency: 'mxn',
        status: 'succeeded',
        payment_method_types: ['card'],
        receipt_email: 'maria.gonzalez@example.com',
      },
    },
    {
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_3QR2345678901BCD',
      stripe_session_id: 'cs_test_b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1',
      raw: {
        id: 'pi_3QR2345678901BCD',
        object: 'payment_intent',
        amount: 72500,
        currency: 'mxn',
        status: 'succeeded',
        payment_method_types: ['card'],
        receipt_email: 'carlos.ramirez@example.com',
      },
    },
    {
      status: 'pending',
      stripe_payment_intent_id: 'pi_3QR3456789012CDE',
      stripe_session_id: 'cs_test_c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2',
      raw: {
        id: 'pi_3QR3456789012CDE',
        object: 'payment_intent',
        amount: 101500,
        currency: 'mxn',
        status: 'processing',
        payment_method_types: ['card'],
        receipt_email: 'ana.martinez@example.com',
      },
    },
    {
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_3QR4567890123DEF',
      stripe_session_id: 'cs_test_d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3',
      raw: {
        id: 'pi_3QR4567890123DEF',
        object: 'payment_intent',
        amount: 101500,
        currency: 'mxn',
        status: 'succeeded',
        payment_method_types: ['card'],
        receipt_email: 'roberto.silva@example.com',
      },
    },
    {
      status: 'failed',
      stripe_payment_intent_id: 'pi_3QR5678901234EFG',
      stripe_session_id: 'cs_test_e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4',
      raw: {
        id: 'pi_3QR5678901234EFG',
        object: 'payment_intent',
        amount: 58000,
        currency: 'mxn',
        status: 'failed',
        payment_method_types: ['card'],
        receipt_email: 'jose.hernandez@example.com',
        last_payment_error: {
          message: 'Your card was declined.',
          type: 'card_error',
          code: 'card_declined',
        },
      },
    },
    {
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_3QR6789012345FGH',
      stripe_session_id: 'cs_test_f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5',
      raw: {
        id: 'pi_3QR6789012345FGH',
        object: 'payment_intent',
        amount: 101500,
        currency: 'mxn',
        status: 'succeeded',
        payment_method_types: ['card'],
        receipt_email: 'laura.fernandez@example.com',
      },
    },
  ]

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < bookings.length && i < paymentsData.length; i++) {
    const booking = bookings[i]
    const paymentData = paymentsData[i]

    const payment = {
      booking_id: booking.id,
      amount: booking.amount,
      currency: booking.currency,
      status: paymentData.status,
      stripe_payment_intent_id: paymentData.stripe_payment_intent_id,
      stripe_session_id: paymentData.stripe_session_id,
      raw: paymentData.raw,
    }

    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando pago:`, error.message)
      errorCount++
    } else {
      console.log(
        `✅ Pago creado: ${data.stripe_payment_intent_id.slice(0, 15)}... - $${data.amount.toLocaleString()} ${data.currency.toUpperCase()} - ${data.status}`
      )
      successCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Pagos creados exitosamente: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Errores: ${errorCount}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver en admin: http://localhost:3001/admin/payments\n')
}

createSamplePayments().catch(console.error)
