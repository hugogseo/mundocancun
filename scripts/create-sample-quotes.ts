import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createSampleQuotes() {
  console.log('💰 Creando cotizaciones de ejemplo...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener las consultas existentes
  const { data: inquiries, error: inquiriesError } = await supabase
    .from('lead_inquiries')
    .select('id, full_name, package_id, guests, budget')
    .order('created_at', { ascending: false })
    .limit(6)

  if (inquiriesError || !inquiries || inquiries.length === 0) {
    console.error('❌ No hay consultas disponibles. Crea consultas primero.')
    return
  }

  console.log(`📋 Encontradas ${inquiries.length} consultas\n`)

  // Definir diferentes estados y detalles para cada cotización
  const quotesData = [
    {
      status: 'pending',
      priceMultiplier: 1.0,
      details: {
        items: [
          { description: 'Hospedaje 7 noches - Hotel 5 estrellas', amount: 25000 },
          { description: 'Tour Isla Mujeres', amount: 3500 },
          { description: 'Cena romántica en la playa', amount: 4500 },
          { description: 'Traslados aeropuerto-hotel', amount: 2000 },
        ],
        notes: 'Precio especial por luna de miel. Incluye upgrade de habitación sin costo.',
        validUntil: '2025-12-01',
      },
    },
    {
      status: 'accepted',
      priceMultiplier: 0.95,
      details: {
        items: [
          { description: 'Hospedaje 5 noches - Suites familiares', amount: 35000 },
          { description: 'Tours y actividades para niños', amount: 8000 },
          { description: 'All-inclusive plan', amount: 12000 },
        ],
        notes: '5% de descuento aplicado por reserva anticipada.',
        validUntil: '2025-11-15',
      },
    },
    {
      status: 'sent',
      priceMultiplier: 1.0,
      details: {
        items: [
          { description: 'Hospedaje 7 noches - Habitaciones premium', amount: 48000 },
          { description: 'Spa package completo', amount: 15000 },
          { description: 'Tours culturales privados', amount: 12000 },
        ],
        notes: 'Cotización para grupo de 6 personas. Incluye desayunos y cenas.',
        validUntil: '2026-01-05',
      },
    },
    {
      status: 'accepted',
      priceMultiplier: 1.1,
      details: {
        items: [
          { description: 'Hospedaje 7 noches - Suite romántica', amount: 28000 },
          { description: 'Cena aniversario premium', amount: 6000 },
          { description: 'Decoración especial de habitación', amount: 2000 },
          { description: 'Fotografía profesional', amount: 4000 },
        ],
        notes: 'Paquete especial aniversario con servicios premium.',
        validUntil: '2025-11-25',
      },
    },
    {
      status: 'sent',
      priceMultiplier: 0.9,
      details: {
        items: [
          { description: 'Hospedaje 7 noches - Habitación estándar', amount: 18000 },
          { description: 'Tours básicos incluidos', amount: 5000 },
          { description: 'Traslados aeropuerto', amount: 2000 },
          { description: 'Seguro de viaje', amount: 1500 },
        ],
        notes: 'Paquete económico para primera vez en Cancún. 10% descuento aplicado.',
        validUntil: '2026-02-10',
      },
    },
    {
      status: 'expired',
      priceMultiplier: 1.15,
      details: {
        items: [
          { description: 'Hospedaje 4 noches - Suite deluxe', amount: 16000 },
          { description: 'Tours express', amount: 4000 },
          { description: 'Servicio urgente (tarifa premium)', amount: 3500 },
        ],
        notes: 'Cotización exprés con tarifa premium por disponibilidad inmediata.',
        validUntil: '2025-10-28',
      },
    },
  ]

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < inquiries.length && i < quotesData.length; i++) {
    const inquiry = inquiries[i]
    const quoteData = quotesData[i]

    // Calcular precio total basado en el presupuesto de la consulta
    const basePrice = inquiry.budget || 30000
    const totalPrice = basePrice * quoteData.priceMultiplier

    const quote = {
      package_id: inquiry.package_id,
      inquiry_id: inquiry.id,
      price_total: totalPrice,
      currency: 'MXN',
      status: quoteData.status,
      details: quoteData.details,
    }

    const { data, error } = await supabase
      .from('lead_quotes')
      .insert(quote)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando cotización para ${inquiry.full_name}:`, error.message)
      errorCount++
    } else {
      console.log(`✅ Cotización creada: ${inquiry.full_name} - $${data.price_total.toLocaleString()} MXN (${data.status})`)
      successCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Cotizaciones creadas exitosamente: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Errores: ${errorCount}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver en admin: http://localhost:3001/admin/quotes\n')
}

createSampleQuotes().catch(console.error)
