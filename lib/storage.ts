import { createClient } from '@/lib/supabase/client'

export async function uploadPackageImage(file: File, path: string): Promise<string> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${path}-${Date.now()}.${fileExt}`
  const filePath = `packages/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('packages')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('packages')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deletePackageImage(url: string): Promise<void> {
  const supabase = createClient()

  // Extract path from public URL
  const path = url.split('/packages/').pop()
  if (!path) return

  const { error } = await supabase.storage
    .from('packages')
    .remove([`packages/${path}`])

  if (error) {
    console.error('Error deleting image:', error)
  }
}
