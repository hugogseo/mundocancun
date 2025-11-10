import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createSampleInquiry() {
  console.log('📝 Creando consulta de ejemplo...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener el primer paquete disponible
  const { data: packages } = await supabase
    .from('pkg_packages')
    .select('id, title')
    .limit(1)
    .single()

  if (!packages) {
    console.error('❌ No hay paquetes disponibles. Crea un paquete primero.')
    return
  }

  console.log(`📦 Paquete encontrado: ${packages.title}`)

  // Crear consulta de ejemplo
  const inquiry = {
    package_id: packages.id,
    full_name: 'María González',
    email: 'maria.gonzalez@example.com',
    phone: '+52 998 123 4567',
    dates: '[2025-12-15,2025-12-22)',
    guests: 2,
    budget: 35000.00,
    notes: 'Hola, estoy interesada en este paquete para mi luna de miel. ¿Podrían darme más información sobre las fechas disponibles en diciembre? Somos 2 adultos y nos gustaría incluir actividades románticas.',
    source: 'website',
  }

  const { data, error } = await supabase
    .from('lead_inquiries')
    .insert(inquiry)
    .select()
    .single()

  if (error) {
    console.error('❌ Error al crear consulta:', error.message)
    return
  }

  console.log('\n✅ Consulta creada exitosamente!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📧 Cliente: ${data.full_name}`)
  console.log(`📬 Email: ${data.email}`)
  console.log(`📞 Teléfono: ${data.phone}`)
  console.log(`📦 Paquete: ${packages.title}`)
  console.log(`📅 Fechas: ${data.dates}`)
  console.log(`👥 Huéspedes: ${data.guests}`)
  console.log(`💰 Presupuesto: $${data.budget} MXN`)
  console.log(`💬 Notas: ${data.notes}`)
  console.log(`🌐 Fuente: ${data.source}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver en admin: http://localhost:3001/admin/inquiries\n')
}

createSampleInquiry().catch(console.error)
