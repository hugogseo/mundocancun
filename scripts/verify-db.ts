import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function verifyDatabase() {
  console.log('🔍 Verificando conexión a Supabase...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Verificar conexión
  console.log('📡 URL de Supabase:', supabaseUrl)

  try {
    // 2. Verificar autenticación
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.log('❌ Error de autenticación:', authError.message)
    } else {
      console.log('✅ Autenticación funcionando')
      console.log(`   Usuarios registrados: ${users?.length || 0}`)
    }
  } catch (error: any) {
    console.log('⚠️  Auth:', error.message)
  }

  console.log('\n📊 Verificando tablas...\n')

  // Lista de tablas esperadas
  const tables = [
    'profiles',
    'cat_categories',
    'pkg_packages',
    'pkg_package_images',
    'pkg_package_tags',
    'lead_inquiries',
    'lead_quotes',
    'bookings',
    'payments',
    'chat_sessions',
    'chat_messages'
  ]

  let allTablesExist = true

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: No existe o sin permisos`)
        console.log(`   Error: ${error.message}`)
        allTablesExist = false
      } else {
        console.log(`✅ ${table}: ${count || 0} registros`)
      }
    } catch (error: any) {
      console.log(`❌ ${table}: Error - ${error.message}`)
      allTablesExist = false
    }
  }

  console.log('\n🔐 Verificando Row Level Security (RLS)...\n')

  // Verificar RLS en tablas críticas
  const rlsTables = ['pkg_packages', 'bookings', 'payments']

  for (const table of rlsTables) {
    try {
      // Intentar consulta sin autenticación (debería fallar o estar limitada)
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data, error } = await anonClient.from(table).select('id').limit(1)

      if (error) {
        console.log(`✅ ${table}: RLS activo (requiere autenticación)`)
      } else {
        console.log(`⚠️  ${table}: RLS permite lectura pública (${data?.length || 0} registros visibles)`)
      }
    } catch (error: any) {
      console.log(`❌ ${table}: Error verificando RLS - ${error.message}`)
    }
  }

  console.log('\n🗄️  Verificando Storage...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log('❌ Storage: Error al listar buckets')
      console.log(`   ${error.message}`)
    } else {
      console.log('✅ Storage funcionando')
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   📦 Bucket: ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
        })
      } else {
        console.log('   ⚠️  No hay buckets creados. Crea el bucket "packages" para las imágenes.')
      }
    }
  } catch (error: any) {
    console.log('❌ Storage:', error.message)
  }

  console.log('\n' + '='.repeat(60))

  if (allTablesExist) {
    console.log('✅ Base de datos configurada correctamente')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Crear bucket "packages" en Storage (si no existe)')
    console.log('   2. Configurar políticas de Storage para el bucket')
    console.log('   3. Crear usuario admin/editor para acceder al panel')
    console.log('   4. Poblar categorías iniciales (npm run seed)')
  } else {
    console.log('❌ Faltan tablas en la base de datos')
    console.log('\n📝 Acción requerida:')
    console.log('   Ejecuta el schema en Supabase SQL Editor:')
    console.log('   c:\\Hugo\\MUndo Cancun\\pagina dinamica\\supabase\\schema.sql')
  }

  console.log('='.repeat(60) + '\n')
}

verifyDatabase().catch(console.error)
