import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createCompletePackages() {
  console.log('📦 Creando 3 paquetes adicionales...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener categorías
  const { data: categories } = await supabase
    .from('cat_categories')
    .select('id, name')
    .order('name')

  if (!categories || categories.length === 0) {
    console.error('❌ No hay categorías disponibles')
    return
  }

  console.log(`✅ Categorías disponibles: ${categories.map(c => c.name).join(', ')}\n`)

  // Obtener usuario admin
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const adminUser = users[0]

  if (!adminUser) {
    console.error('❌ No hay usuarios disponibles')
    return
  }

  const packagesData = [
    {
      title: 'Aventura en Playa del Carmen',
      slug: 'aventura-playa-carmen',
      destination: 'Playa del Carmen, Quintana Roo',
      short_description: 'Descubre la vibrante vida nocturna y playas paradisíacas de Playa del Carmen.',
      long_description: 'Descubre la vibrante vida nocturna y playas paradisíacas de Playa del Carmen. Incluye acceso a cenotes, Quinta Avenida y tours a ruinas mayas. Perfecto para quienes buscan combinar relax en la playa con aventura cultural.',
      duration_nights: 5,
      price_base: 12500,
      booking_mode: 'instant',
      status: 'published',
      cover_url: 'https://images.unsplash.com/photo-1512813498716-3e640fed3f39?w=1200&q=80',
      category: 'Resort',
    },
    {
      title: 'Romance en Isla Mujeres',
      slug: 'romance-isla-mujeres',
      destination: 'Isla Mujeres, Quintana Roo',
      short_description: 'Escapada romántica perfecta para parejas en un paraíso caribeño.',
      long_description: 'Escapada romántica perfecta para parejas. Disfruta de aguas cristalinas, snorkel con tortugas, y cenas privadas en la playa bajo las estrellas. Incluye suite con vista al mar, masaje de parejas y experiencias exclusivas diseñadas para el romance.',
      duration_nights: 4,
      price_base: 18900,
      booking_mode: 'quote',
      status: 'published',
      cover_url: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80',
      category: 'Island',
    },
    {
      title: 'Aventura Familiar Xcaret',
      slug: 'aventura-familiar-xcaret',
      destination: 'Cancún - Riviera Maya',
      short_description: 'El paquete perfecto para familias con niños. Parques, diversión y all-inclusive.',
      long_description: 'El paquete perfecto para familias. Incluye acceso a parques temáticos Xcaret y Xel-Há, actividades para niños y adultos, kids club premium, y alojamiento todo incluido en hotel 5 estrellas. Los niños disfrutarán de albercas con toboganes, shows nocturnos y aventuras acuáticas.',
      duration_nights: 6,
      price_base: 28500,
      booking_mode: 'instant',
      status: 'published',
      cover_url: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80',
      category: 'Familiar',
      hasFullFlow: true, // Este paquete tendrá flujo completo
    },
  ]

  let packagesCreated = 0

  for (const pkgData of packagesData) {
    // Buscar categoría
    const category = categories.find(c => c.name.toLowerCase().includes(pkgData.category.toLowerCase()))

    if (!category) {
      console.log(`⚠️  Categoría "${pkgData.category}" no encontrada, usando la primera disponible`)
    }

    const categoryId = category?.id || categories[0].id

    // Crear paquete
    const { data: newPackage, error: pkgError } = await supabase
      .from('pkg_packages')
      .insert({
        title: pkgData.title,
        slug: pkgData.slug,
        destination: pkgData.destination,
        short_description: pkgData.short_description,
        long_description: pkgData.long_description,
        duration_nights: pkgData.duration_nights,
        price_base: pkgData.price_base,
        booking_mode: pkgData.booking_mode,
        status: pkgData.status,
        cover_url: pkgData.cover_url,
      })
      .select()
      .single()

    if (pkgError) {
      console.error(`❌ Error creando "${pkgData.title}":`, pkgError.message)
      continue
    }

    console.log(`✅ Paquete creado: ${newPackage.title} ($${newPackage.price_base.toLocaleString()} MXN)`)

    // Asociar con categoría
    await supabase.from('pkg_package_tags').insert({
      package_id: newPackage.id,
      category_id: categoryId,
    })

    packagesCreated++

    // Si es el paquete con flujo completo, crear consulta → cotización → reserva → pago
    if (pkgData.hasFullFlow) {
      console.log(`\n💼 Creando flujo completo para "${pkgData.title}"...\n`)

      // 1. Crear consulta (inquiry)
      const { data: inquiry, error: inquiryError } = await supabase
        .from('lead_inquiries')
        .insert({
          package_id: newPackage.id,
          full_name: 'Pedro Sánchez',
          email: 'pedro.sanchez@example.com',
          phone: '+52 998 765 4321',
          dates: '[2026-03-01,2026-03-07)',
          guests: 4,
          budget: 30000.00,
          notes: 'Familia con 2 niños (5 y 8 años). Nos interesa el paquete todo incluido con actividades para niños. ¿Hay descuento por reserva anticipada?',
          source: 'website',
        })
        .select()
        .single()

      if (inquiryError) {
        console.error('❌ Error creando consulta:', inquiryError.message)
      } else {
        console.log(`   ✅ Consulta creada: ${inquiry.full_name}`)

        // 2. Crear cotización (quote)
        const { data: quote, error: quoteError } = await supabase
          .from('lead_quotes')
          .insert({
            package_id: newPackage.id,
            inquiry_id: inquiry.id,
            price_total: 28500.00,
            currency: 'MXN',
            status: 'accepted',
            details: {
              items: [
                { description: 'Hospedaje 6 noches - Hotel All-Inclusive 5 estrellas', amount: 20000 },
                { description: 'Entrada Xcaret (4 personas)', amount: 3000 },
                { description: 'Entrada Xel-Há (4 personas)', amount: 3000 },
                { description: 'Traslados aeropuerto privados', amount: 2000 },
                { description: 'Descuento reserva anticipada', amount: 500 },
              ],
              notes: 'Descuento especial del 10% aplicado por reserva con más de 3 meses de anticipación. Incluye upgrade de habitación a suite familiar sin costo adicional.',
              validUntil: '2026-02-15',
            },
          })
          .select()
          .single()

        if (quoteError) {
          console.error('❌ Error creando cotización:', quoteError.message)
        } else {
          console.log(`   ✅ Cotización creada: $${quote.price_total.toLocaleString()} MXN (${quote.status})`)

          // 3. Crear reserva (booking)
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
              package_id: newPackage.id,
              user_id: adminUser.id,
              checkin: '2026-03-01',
              checkout: '2026-03-07',
              guests: 4,
              amount: 28500.00,
              currency: 'MXN',
              status: 'confirmed',
            })
            .select()
            .single()

          if (bookingError) {
            console.error('❌ Error creando reserva:', bookingError.message)
          } else {
            console.log(`   ✅ Reserva creada: ${booking.checkin} al ${booking.checkout} (${booking.status})`)

            // 4. Crear pago (payment)
            const { data: payment, error: paymentError } = await supabase
              .from('payments')
              .insert({
                booking_id: booking.id,
                amount: 28500.00,
                currency: 'MXN',
                status: 'succeeded',
                stripe_payment_intent_id: 'pi_3QR7890123456GHI',
                stripe_session_id: 'cs_test_g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6',
                raw: {
                  id: 'pi_3QR7890123456GHI',
                  object: 'payment_intent',
                  amount: 28500,
                  currency: 'mxn',
                  status: 'succeeded',
                  payment_method_types: ['card'],
                  receipt_email: 'pedro.sanchez@example.com',
                  description: 'Paquete Familiar Xcaret - 6 noches',
                  created: Math.floor(Date.now() / 1000),
                },
              })
              .select()
              .single()

            if (paymentError) {
              console.error('❌ Error creando pago:', paymentError.message)
            } else {
              console.log(`   ✅ Pago creado: $${payment.amount.toLocaleString()} MXN (${payment.status})`)
            }
          }
        }
      }

      console.log('\n   🎉 Flujo completo creado exitosamente!\n')
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Paquetes creados: ${packagesCreated}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver paquetes en: http://localhost:3001')
  console.log('📦 Ver en admin: http://localhost:3001/admin/packages')
  console.log('💼 Ver consultas: http://localhost:3001/admin/inquiries')
  console.log('💰 Ver cotizaciones: http://localhost:3001/admin/quotes')
  console.log('📅 Ver reservas: http://localhost:3001/admin/bookings')
  console.log('💳 Ver pagos: http://localhost:3001/admin/payments\n')
}

createCompletePackages().catch(console.error)
