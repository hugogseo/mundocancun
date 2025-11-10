import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createMultipleInquiries() {
  console.log('📝 Creando múltiples consultas de ejemplo...\n')

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

  console.log(`📦 Paquete encontrado: ${packages.title}\n`)

  const inquiries = [
    {
      package_id: packages.id,
      full_name: 'Carlos Ramírez',
      email: 'carlos.ramirez@example.com',
      phone: '+52 998 234 5678',
      dates: '[2025-11-20,2025-11-25)',
      guests: 4,
      budget: 50000.00,
      notes: 'Viaje familiar con 2 adultos y 2 niños (8 y 10 años). ¿Incluyen actividades para niños?',
      source: 'website',
    },
    {
      package_id: packages.id,
      full_name: 'Ana Patricia Martínez',
      email: 'ana.martinez@example.com',
      phone: '+52 55 1234 5678',
      dates: '[2026-01-10,2026-01-17)',
      guests: 6,
      budget: 75000.00,
      notes: 'Grupo de amigas para celebrar cumpleaños. Nos interesan actividades de spa y excursiones culturales.',
      source: 'website',
    },
    {
      package_id: packages.id,
      full_name: 'Roberto Silva',
      email: 'roberto.silva@example.com',
      phone: '+52 998 345 6789',
      dates: '[2025-12-01,2025-12-08)',
      guests: 2,
      budget: 40000.00,
      notes: 'Aniversario de bodas. Buscamos algo romántico con cena especial incluida.',
      source: 'facebook',
    },
    {
      package_id: packages.id,
      full_name: 'Laura Fernández',
      email: 'laura.fernandez@example.com',
      phone: null,
      dates: '[2026-02-14,2026-02-21)',
      guests: 2,
      budget: 30000.00,
      notes: 'Primer viaje a Cancún. ¿El paquete incluye traslados del aeropuerto?',
      source: 'google',
    },
    {
      package_id: packages.id,
      full_name: 'José Luis Hernández',
      email: 'jose.hernandez@example.com',
      phone: '+52 998 456 7890',
      dates: '[2025-11-01,2025-11-05)',
      guests: 3,
      budget: 25000.00,
      notes: 'Urgente para la próxima semana. ¿Hay disponibilidad?',
      source: 'instagram',
    },
  ]

  let successCount = 0
  let errorCount = 0

  for (const inquiry of inquiries) {
    const { data, error } = await supabase
      .from('lead_inquiries')
      .insert(inquiry)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creando consulta de ${inquiry.full_name}:`, error.message)
      errorCount++
    } else {
      console.log(`✅ Consulta creada: ${data.full_name} (${data.guests} huéspedes, $${data.budget} MXN)`)
      successCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Consultas creadas exitosamente: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Errores: ${errorCount}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 Ver en admin: http://localhost:3001/admin/inquiries\n')
}

createMultipleInquiries().catch(console.error)
