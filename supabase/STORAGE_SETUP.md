# Configuración de Supabase Storage

Este documento describe cómo configurar el bucket de Storage en Supabase para almacenar las imágenes de los paquetes.

## Crear el Bucket

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Clic en **New bucket**
4. Configura el bucket:
   - **Name**: `packages`
   - **Public bucket**: ✅ Marcado (para acceso público a las imágenes)
   - Clic en **Create bucket**

## Configurar Políticas de Storage

Por defecto, el bucket público permite lecturas pero no escrituras. Necesitamos configurar políticas para permitir que usuarios autenticados (admin/editor) suban imágenes.

### Política 1: Lectura Pública

Esta política ya viene configurada automáticamente al crear un bucket público, pero si necesitas recrearla:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'packages');
```

### Política 2: Subida para Admin/Editor

```sql
-- Permitir subida de imágenes solo a admin/editor
CREATE POLICY "Admin/Editor Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);
```

### Política 3: Actualización para Admin/Editor

```sql
-- Permitir actualización de imágenes solo a admin/editor
CREATE POLICY "Admin/Editor Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);
```

### Política 4: Eliminación para Admin/Editor

```sql
-- Permitir eliminación de imágenes solo a admin/editor
CREATE POLICY "Admin/Editor Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);
```

## Aplicar las Políticas

1. Ve a **Storage** > **Policies** en tu proyecto de Supabase
2. Selecciona el bucket `packages`
3. Clic en **New Policy**
4. Para cada política:
   - Selecciona el tipo de operación (SELECT, INSERT, UPDATE, DELETE)
   - Pega el código SQL correspondiente
   - Clic en **Save policy**

## Alternativa: Script SQL Completo

También puedes ejecutar todas las políticas de una vez en el **SQL Editor**:

```sql
-- Habilitar RLS en storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'packages');

-- Subida para admin/editor
CREATE POLICY "Admin/Editor Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Actualización para admin/editor
CREATE POLICY "Admin/Editor Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Eliminación para admin/editor
CREATE POLICY "Admin/Editor Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'packages'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);
```

## Verificar Configuración

Para verificar que todo funciona:

1. Inicia sesión como un usuario con rol `admin` o `editor`
2. Ve a `/admin/packages/new`
3. Intenta subir una imagen de portada
4. Si la subida es exitosa, verás la imagen en el preview
5. Verifica que la imagen esté en Storage > `packages` bucket

## Límites y Consideraciones

- **Tamaño máximo por archivo**: 50MB (configurable en Project Settings)
- **Tamaño total del bucket**: Según tu plan de Supabase
- **Formatos recomendados**: JPG, PNG, WEBP
- **Optimización**: Considera comprimir las imágenes antes de subirlas

## Troubleshooting

### Error: "new row violates row-level security policy"

- Verifica que el usuario tenga rol `admin` o `editor` en la tabla `profiles`
- Verifica que las políticas de RLS estén correctamente configuradas
- Revisa los logs en **Storage** > **Logs**

### Error: "Bucket not found"

- Asegúrate de que el bucket se llame exactamente `packages` (minúsculas)
- Verifica que el bucket esté marcado como público

### Imágenes no se ven en el frontend

- Verifica que la URL pública del bucket esté correctamente configurada
- Asegúrate de que el dominio de Supabase Storage esté en `next.config.ts` > `images.remotePatterns`

---

**Nota**: Las políticas de RLS aplican tanto a la interfaz web de Supabase como a las operaciones desde el código de la aplicación.
