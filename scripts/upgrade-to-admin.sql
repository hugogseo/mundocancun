-- ============================================================
-- Actualizar usuario a Administrador
-- ============================================================
-- Usuario: admin@mundocancun.com
-- UUID: 47c0aa30-fb76-47af-8885-a0afbc0e7dc0
-- ============================================================

-- Actualizar rol a admin y agregar nombre
UPDATE profiles
SET
  role = 'admin',
  full_name = 'Administrador',
  updated_at = NOW()
WHERE id = '47c0aa30-fb76-47af-8885-a0afbc0e7dc0';

-- Verificar que se actualizó correctamente
SELECT
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
FROM profiles
WHERE id = '47c0aa30-fb76-47af-8885-a0afbc0e7dc0';
