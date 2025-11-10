import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkBookings() {
  console.log('📋 Verificando reservas...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Total de reservas: ${data?.length || 0}\n`)

  if (data && data.length > 0) {
    data.forEach((booking, index) => {
      console.log(`${index + 1}. Reserva #${booking.id.slice(0, 8)}`)
      console.log(`   Check-in: ${booking.checkin}`)
      console.log(`   Check-out: ${booking.checkout}`)
      console.log(`   Huéspedes: ${booking.guests}`)
      console.log(`   Monto: $${booking.amount} ${booking.currency}`)
      console.log(`   Estado: ${booking.status}`)
      console.log('')
    })
  } else {
    console.log('⚠️  No hay reservas en la base de datos')
  }
}

checkBookings().catch(console.error)
