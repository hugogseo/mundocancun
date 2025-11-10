import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkSchema() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Intentar insertar un registro mínimo para ver qué campos acepta
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .limit(1)

  console.log('Campos disponibles:', data)
  console.log('Error:', error)
}

checkSchema().catch(console.error)
