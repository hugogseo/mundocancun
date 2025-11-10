import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function makeAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('🔧 Convirtiendo usuario en Administrador...\n')

  const userId = '47c0aa30-fb76-47af-8885-a0afbc0e7dc0'

  // Actualizar perfil
  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      full_name: 'Administrador'
    })
    .eq('id', userId)
    .select()

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log('✅ Usuario actualizado exitosamente!\n')

  // Verificar
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    console.log('━'.repeat(60))
    console.log('📋 Perfil Actualizado:')
    console.log('━'.repeat(60))
    console.log(`👤 Nombre: ${profile.full_name}`)
    console.log(`🔑 Rol: ${profile.role}`)
    console.log(`📧 Email: ${profile.email || 'N/A'}`)
    console.log(`🆔 ID: ${profile.id}`)
    console.log('━'.repeat(60))
    console.log('')
    console.log('✅ Ahora puedes acceder al panel de administración:')
    console.log('   URL: http://localhost:3000/admin')
    console.log('')
    console.log('📧 Credenciales:')
    console.log('   Email: admin@mundocancun.com')
    console.log('   Contraseña: (la que configuraste)')
    console.log('━'.repeat(60))
  }
}

makeAdmin().catch(console.error)
