# Chat Widget - Documentación

## Descripción General

Widget de chat flotante integrado con N8N para soporte en tiempo real a los usuarios. El chat está fijado en la esquina inferior derecha, maneja sesiones persistentes con cookies, y muestra notificaciones toast para errores y reconexiones.

## Arquitectura

### Componentes

1. **ChatWidget** (`components/chat-widget.tsx`)
   - Widget flotante de chat con botón toggle
   - Gestión de sesiones con cookies
   - UI completa con historial de mensajes
   - Integración con Toasts para notificaciones

2. **API Chat** (`app/api/chat/route.ts`)
   - POST: Recibe mensajes, los guarda y los reenvía a N8N
   - GET: Recupera historial de mensajes de una sesión
   - Usa Service Role client para bypass de RLS

3. **Toast System** (`components/ui/toast.tsx`, `hooks/use-toast.ts`)
   - Notificaciones para errores y mensajes del sistema
   - Auto-dismiss después de un tiempo

## Flujo de Datos

```
Usuario → ChatWidget → /api/chat → N8N Webhook
                          ↓              ↓
                    chat_messages ← Respuesta
                          ↓
                    ChatWidget (actualiza UI)
```

## Sesiones de Chat

### Cookie Management

El widget usa una cookie `chat_session_id` para mantener la sesión:

```typescript
// Generar ID de sesión
chat_{timestamp}_{random_string}

// Ejemplo: chat_1704234567890_x8k2n5p9q
```

**Duración de la cookie:** 365 días

### Creación de Sesión

Cuando no existe cookie:
1. Se genera un nuevo `session_id`
2. Se guarda en cookie `chat_session_id`
3. Se crea registro en tabla `chat_sessions`
4. Se guarda metadata (user_agent, created_from)

```typescript
await supabase.from("chat_sessions").insert({
  id: sessionId,
  metadata: {
    created_from: "chat_widget",
    user_agent: navigator.userAgent,
  },
})
```

## API Endpoints

### POST /api/chat

Envía un mensaje y obtiene respuesta del asistente.

**Request:**
```json
{
  "sessionId": "chat_1704234567890_x8k2n5p9q",
  "message": "¿Cuáles son los paquetes disponibles?"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "reply": "Tenemos varios paquetes disponibles..."
}
```

**Response (error):**
```json
{
  "error": "Error message"
}
```

**Características:**
- Timeout de 10 segundos para N8N webhook
- Fallback si N8N no está configurado
- Manejo de errores con mensajes en español
- Guarda todos los mensajes en `chat_messages`

### GET /api/chat

Recupera historial de mensajes de una sesión.

**Request:**
```
GET /api/chat?sessionId=chat_1704234567890_x8k2n5p9q
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "session_id": "chat_1704234567890_x8k2n5p9q",
      "sender": "user",
      "message": "Hola",
      "created_at": "2025-01-08T12:00:00Z"
    },
    {
      "id": "uuid",
      "session_id": "chat_1704234567890_x8k2n5p9q",
      "sender": "assistant",
      "message": "¡Hola! ¿En qué puedo ayudarte?",
      "created_at": "2025-01-08T12:00:05Z"
    }
  ]
}
```

## Integración con N8N

### Configuración

Agregar en `.env`:
```bash
N8N_CHAT_WEBHOOK_URL=https://n8n.tudominio.com/webhook/chat
```

### Formato de Request a N8N

```json
{
  "sessionId": "chat_1704234567890_x8k2n5p9q",
  "message": "mensaje del usuario",
  "timestamp": "2025-01-08T12:00:00.000Z"
}
```

### Formato Esperado de Response

N8N debe responder con uno de estos formatos:

```json
{
  "reply": "respuesta del asistente"
}
```

O alternativamente:
```json
{
  "message": "respuesta del asistente"
}
```

O:
```json
{
  "response": "respuesta del asistente"
}
```

### Timeout y Fallbacks

1. **Sin N8N configurado:**
   - Respuesta: "El servicio de chat no está disponible en este momento. Por favor, contáctanos por email."

2. **Timeout (>10 segundos):**
   - Respuesta: "La solicitud tardó demasiado. Por favor, intenta de nuevo."

3. **Error de N8N:**
   - Se muestra toast con error
   - Mensaje no se envía

## Notificaciones Toast

El widget usa el sistema de Toasts de shadcn/ui para mostrar errores:

### Tipos de Notificaciones

1. **Error de sesión:**
```typescript
toast({
  title: "Error",
  description: "No se pudo iniciar la sesión de chat.",
  variant: "destructive",
})
```

2. **Error al cargar historial:**
```typescript
toast({
  title: "Error",
  description: "No se pudo cargar el historial de chat.",
  variant: "destructive",
})
```

3. **Error al enviar mensaje:**
```typescript
toast({
  title: "Error",
  description: "No se pudo enviar el mensaje. Por favor, intenta de nuevo.",
  variant: "destructive",
})
```

## UI/UX Features

### Estados del Widget

1. **Cerrado:** Botón flotante con icono de chat
2. **Abierto:** Ventana de chat completa (380x500px)

### Características de UI

- **Auto-scroll:** Scroll automático al recibir nuevos mensajes
- **Optimistic Updates:** Mensajes del usuario aparecen inmediatamente
- **Loading States:** Indicador de "Escribiendo..." mientras espera respuesta
- **Timestamp:** Hora local en cada mensaje
- **Enter to Send:** Enviar con Enter (sin Shift)
- **Responsive:** Diseño adaptativo para móvil

### Diseño

```
┌─────────────────────────────────┐
│ 💬 Chat de Soporte         ✕   │
│ Estamos aquí para ayudarte      │
├─────────────────────────────────┤
│                                 │
│  Usuario: Hola               │
│  12:30                          │
│                                 │
│ Asistente: ¡Hola! ¿En qué      │
│ puedo ayudarte?                 │
│ 12:30                           │
│                                 │
│  ...escribiendo...              │
│                                 │
├─────────────────────────────────┤
│ [  Escribe tu mensaje...  ] [→] │
└─────────────────────────────────┘
```

## Base de Datos

### Tablas Involucradas

**chat_sessions:**
```sql
- id (text, PK) - Session ID from cookie
- user_id (uuid, FK) - NULL for anonymous
- metadata (jsonb) - User agent, created_from, etc.
- created_at (timestamp)
- updated_at (timestamp)
```

**chat_messages:**
```sql
- id (uuid, PK)
- session_id (text, FK)
- sender (text) - 'user' | 'assistant'
- message (text)
- metadata (jsonb) - Additional data
- created_at (timestamp)
```

### RLS Policies

**Service Role Client:** El API usa Service Role client que bypasea todas las políticas RLS, permitiendo operaciones sin autenticación.

## Testing

### Test Checklist

- [ ] Nueva sesión crea cookie correctamente
- [ ] Nueva sesión crea registro en `chat_sessions`
- [ ] Mensajes se guardan en `chat_messages`
- [ ] Historial se carga al abrir chat
- [ ] N8N recibe formato correcto
- [ ] Timeout funciona después de 10 segundos
- [ ] Fallback sin N8N configurado
- [ ] Toast aparece en errores
- [ ] Scroll automático funciona
- [ ] Enter envía mensaje
- [ ] Loading state durante envío
- [ ] Widget responsive en móvil

### Test Manual

1. **Primera visita:**
```bash
# Borrar cookies
# Abrir widget
# Verificar que se crea cookie y sesión
```

2. **Envío de mensaje:**
```bash
# Escribir mensaje
# Presionar Enter
# Verificar que aparece inmediatamente
# Verificar respuesta del asistente
```

3. **Reconexión:**
```bash
# Cerrar y abrir widget
# Verificar que historial se carga
# Verificar que cookie persiste
```

4. **Error handling:**
```bash
# Desconectar N8N
# Enviar mensaje
# Verificar toast de error
```

## Deployment

### Variables de Entorno Requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# N8N (opcional)
N8N_CHAT_WEBHOOK_URL=https://n8n.tudominio.com/webhook/chat
```

### Pasos de Deployment

1. Verificar que tablas `chat_sessions` y `chat_messages` existen
2. Configurar `N8N_CHAT_WEBHOOK_URL` (opcional)
3. Verificar que Service Role Key está configurado
4. Deploy de la aplicación
5. Test en producción

## Mantenimiento

### Limpieza de Sesiones Antiguas

Crear un cron job para limpiar sesiones viejas:

```sql
-- Borrar sesiones sin actividad por 30 días
DELETE FROM chat_sessions
WHERE updated_at < NOW() - INTERVAL '30 days';

-- Los mensajes se borran automáticamente por CASCADE
```

### Monitoreo

Queries útiles para monitoreo:

```sql
-- Total de sesiones activas hoy
SELECT COUNT(*) FROM chat_sessions
WHERE created_at::date = CURRENT_DATE;

-- Mensajes por día
SELECT
  created_at::date as date,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE sender = 'user') as user_messages,
  COUNT(*) FILTER (WHERE sender = 'assistant') as assistant_messages
FROM chat_messages
GROUP BY created_at::date
ORDER BY date DESC;

-- Sesiones sin mensajes (posible problema)
SELECT * FROM chat_sessions cs
WHERE NOT EXISTS (
  SELECT 1 FROM chat_messages cm
  WHERE cm.session_id = cs.id
);
```

## Troubleshooting

### Widget no aparece
- Verificar que `<ChatWidget />` está en layout
- Verificar que `<Toaster />` está en layout
- Check console para errores de hydration

### Mensajes no se envían
- Verificar `SUPABASE_SERVICE_ROLE_KEY` en .env
- Check logs del API en `/api/chat`
- Verificar que tablas existen en Supabase

### N8N no responde
- Verificar URL del webhook
- Check timeout (10 segundos)
- Verificar formato de respuesta de N8N
- Ver logs en N8N dashboard

### Cookie no persiste
- Verificar dominio de la cookie
- Check que JavaScript puede acceder a cookies
- Verificar que no hay política de bloqueo de cookies

## Extensiones Futuras

- [ ] Soporte para archivos adjuntos
- [ ] Typing indicators en tiempo real (WebSocket)
- [ ] Rating de respuestas del asistente
- [ ] Transcripción de voz
- [ ] Multi-idioma
- [ ] Analytics avanzado
- [ ] Integración con CRM
- [ ] Chat persistence cross-device (requiere auth)
