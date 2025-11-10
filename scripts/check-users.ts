import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkUsers() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('👥 Verificando usuarios y perfiles...\n')

  // Obtener usuarios de Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.log('❌ Error obteniendo usuarios:', authError.message)
    return
  }

  console.log(`📧 Usuarios en Auth: ${users.length}\n`)

  if (users.length === 0) {
    console.log('⚠️  No hay usuarios registrados.')
    console.log('\n📝 Para crear un usuario administrador:')
    console.log('1. Ve a: https://supabase.com/dashboard/project/pbzmnppgjosviqnkievx/auth/users')
    console.log('2. Click "Add user" > "Create new user"')
    console.log('3. Ingresa email y contraseña')
    console.log('4. Ejecuta el siguiente SQL con el UUID del usuario:\n')
    console.log('   INSERT INTO profiles (id, role, full_name)')
    console.log('   VALUES (\'UUID_DEL_USUARIO\', \'admin\', \'Tu Nombre\');')
    return
  }

  // Mostrar usuarios
  for (const user of users) {
    console.log('━'.repeat(60))
    console.log(`📧 Email: ${user.email}`)
    console.log(`🆔 UUID: ${user.id}`)
    console.log(`📅 Creado: ${new Date(user.created_at).toLocaleString()}`)

    // Buscar perfil asociado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ Sin perfil en tabla profiles')
      console.log('\n💡 Para crear el perfil de admin, ejecuta en SQL Editor:')
      console.log(`   INSERT INTO profiles (id, role, full_name)`)
      console.log(`   VALUES ('${user.id}', 'admin', 'Administrador');`)
    } else {
      console.log(`✅ Perfil encontrado`)
      console.log(`   👤 Nombre: ${profile.full_name || 'Sin nombre'}`)
      console.log(`   🔑 Rol: ${profile.role || 'user'}`)
      console.log(`   📧 Email Contacto: ${profile.email || 'N/A'}`)
      console.log(`   📞 Teléfono: ${profile.phone || 'N/A'}`)

      if (profile.role === 'admin' || profile.role === 'editor') {
        console.log(`   ✅ ACCESO AL PANEL DE ADMIN`)
      } else {
        console.log(`   ⚠️  Sin acceso al panel (rol: ${profile.role})`)
        console.log(`\n💡 Para dar acceso de admin:`)
        console.log(`   UPDATE profiles SET role = 'admin' WHERE id = '${user.id}';`)
      }
    }
    console.log('━'.repeat(60))
    console.log('')
  }

  // Verificar perfiles huérfanos (sin usuario en Auth)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')

  if (allProfiles && allProfiles.length > 0) {
    const authUserIds = users.map(u => u.id)
    const orphanProfiles = allProfiles.filter(p => !authUserIds.includes(p.id))

    if (orphanProfiles.length > 0) {
      console.log('⚠️  Perfiles huérfanos (sin usuario en Auth):')
      orphanProfiles.forEach(p => {
        console.log(`   - ID: ${p.id} | Nombre: ${p.full_name} | Rol: ${p.role}`)
      })
      console.log('\n💡 Estos perfiles deben eliminarse o crear usuarios para ellos.\n')
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN')
  console.log('='.repeat(60))
  console.log(`Total usuarios en Auth: ${users.length}`)
  console.log(`Total perfiles en DB: ${allProfiles?.length || 0}`)

  const admins = allProfiles?.filter(p => p.role === 'admin').length || 0
  const editors = allProfiles?.filter(p => p.role === 'editor').length || 0
  const regularUsers = allProfiles?.filter(p => p.role === 'user' || !p.role).length || 0

  console.log(`   - Admins: ${admins}`)
  console.log(`   - Editors: ${editors}`)
  console.log(`   - Usuarios regulares: ${regularUsers}`)
  console.log('='.repeat(60) + '\n')

  if (admins === 0) {
    console.log('⚠️  ¡No hay usuarios administradores!')
    console.log('   Necesitas al menos un admin para acceder al panel.\n')
  } else {
    console.log('✅ Hay usuarios administradores configurados.')
    console.log('   Puedes acceder al panel en: http://localhost:3000/admin\n')
  }
}

checkUsers().catch(console.error)
