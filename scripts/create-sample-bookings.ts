import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createSampleBookings() {
  console.log('📅 Creando reservas de ejemplo...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener el primer paquete disponible
  const { data: packages } = await supabase
    .from('pkg_packages')
    .select('id, title, price_base')
    .limit(1)
    .single()

  if (!packages) {
    console.error('❌ No hay paquetes disponibles. Crea un paquete primero.')
    return
  }

  console.log(`📦 Paquete encontrado: ${packages.title}\n`)

  // Obtener el usuario admin
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const adminUser = users[0]

  if (!adminUser) {
    console.error('❌ No hay usuarios disponibles.')
    return
  }

  console.log(`👤 Usuario: ${adminUser.email}\n`)

  // Definir diferentes reservas con estados variados
  const bookingsData = [
    {
      checkin: '2025-12-15',
      checkout: '2025-12-22',
      guests: 2,
      status: 'confirmed',
      metadata: {
        customer: {
          name: 'María González',
          email: 'maria.gonzalez@example.com',
          phone: '+52 998 123 4567',
        },
        preferences: {
          roomType: 'Suite Luna de Miel',
          specialRequests: 'Decoración romántica, champagne de bienvenida',
        },
        extras: ['Cena romántica en la playa', 'Upgrade de habitación'],
        paymentMethod: 'credit_card',
        confirmationCode: 'MXCUN-2025-001',
      },
    },
    {
      checkin: '2025-11-20',
      checkout: '2025-11-25',
      guests: 4,
      status: 'confirmed',
      metadata: {
        customer: {
          name: 'Carlos Ramírez',
          email: 'carlos.ramirez@example.com',
          phone: '+52 998 234 5678',
        },
        preferences: {
          roomType: 'Suite Familiar',
          specialRequests: 'Habitación en piso bajo, cunas para niños',
        },
        extras: ['Tours para niños', 'All-inclusive'],
        paymentMethod: 'transfer',
        confirmationCode: 'MXCUN-2025-002',
      },
    },
    {
      checkin: '2026-01-10',
      checkout: '2026-01-17',
      guests: 6,
      status: 'pending',
      metadata: {
        customer: {
          name: 'Ana Patricia Martínez',
          email: 'ana.martinez@example.com',
          phone: '+52 55 1234 5678',
        },
        preferences: {
          roomType: '3 Habitaciones Premium',
          specialRequests: 'Habitaciones contiguas, decoración de cumpleaños',
        },
        extras: ['Spa package', 'Tours culturales privados'],
        paymentMethod: 'pending',
        confirmationCode: 'MXCUN-2026-003',
      },
    },
    {
      checkin: '2025-12-01',
      checkout: '2025-12-08',
      guests: 2,
      status: 'confirmed',
      metadata: {
        customer: {
          name: 'Roberto Silva',
          email: 'roberto.silva@example.com',
          phone: '+52 998 345 6789',
        },
        preferences: {
          roomType: 'Suite Romántica',
          specialRequests: 'Cena de aniversario incluida',
        },
        extras: ['Fotografía profesional', 'Decoración especial'],
        paymentMethod: 'credit_card',
        confirmationCode: 'MXCUN-2025-004',
      },
    },
    {
      checkin: '2025-11-01',
      checkout: '2025-11-05',
      guests: 3,
      status: 'cancelled',
      metadata: {
        customer: {
          name: 'José Luis Hernández',
          email: 'jose.hernandez@example.com',
          phone: '+52 998 456 7890',
        },
        preferences: {
          roomType: 'Habitación Estándar',
          specialRequests: 'Check-in temprano',
        },
        extras: [],
        paymentMethod: 'credit_card',
        confirmationCode: 'MXCUN-2025-005',
        cancellationReason: 'Cliente canceló por cambio de planes',
        cancelledAt: new Date('2025-10-25').toISOString(),
      },
    },
    {
      checkin: '2026-02-14',
      checkout: '2026-02-21',
      guests: 2,
      status: 'completed',
      metadata: {
        customer: {
          name: 'Laura Fernández',
          email: 'laura.fernandez@example.com',
          phone: '+52 998 567 8901',
        },
        preferences: {
          roomType: 'Habitación Vista al Mar',
          specialRequests: 'Piso alto, vista preferencial',
        },
        extras: ['Traslados aeropuerto', 'Seguro de viaje'],
        paymentMethod: 'credit_card',
        confirmationCode: 'MXCUN-2025-006',
        completedAt: new Date('2026-02-21').toISOString(),
        rating: 5,
        review: '¡Experiencia increíble! Todo fue perfecto.',
      },
    },
  ]

  let successCount = 0
  let errorCount = 0

  for (const bookingData of bookingsData) {
    // Calcular el número de noches
    const checkin = new Date(bookingData.checkin)
    const checkout = new Date(bookingData.checkout)
    const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))

    // Calcular precio total
    const basePrice = packages.price_base || 5000
    const totalAmount = basePrice * nights

    const booking = {
      package_id: packages.id,
      user_id: adminUser.id,
      checkin: bookingData.checkin,
      checkout: bookingData.checkout,
      guests: bookingData.guests,
      amount: totalAmount,
      currency: 'MXN',
      status: bookingData.status,
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando reserva:`, error.message)
      errorCount++
    } else {
      const customer = bookingData.metadata.customer
      console.log(
        `✅ Reserva creada: ${customer.name} - ${bookingData.checkin} al ${bookingData.checkout} (${nights} noches) - $${data.amount.toLocaleString()} MXN - ${data.status}`
      )
      successCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Reservas creadas exitosamente: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Errores: ${errorCount}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver en admin: http://localhost:3001/admin/bookings\n')
}

createSampleBookings().catch(console.error)
