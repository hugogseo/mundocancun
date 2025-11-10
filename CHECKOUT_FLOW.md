# Flujo de Checkout con Stripe - Mundo Cancún

Este documento describe el flujo completo de checkout implementado con Stripe en MXN.

## 🔄 Flujo Completo

### 1. Usuario Selecciona Paquete

**Página**: [/packages/[slug]](app/packages/[slug]/page.tsx)

- Usuario ve detalles del paquete
- Si `booking_mode === "payment"`, se muestra el botón "Reservar Ahora"
- Clic abre un diálogo modal con el formulario de reserva

### 2. Formulario de Reserva

**Componente**: [CheckoutButton](components/checkout-button.tsx)

**Campos requeridos:**
- Check-in (fecha)
- Check-out (fecha)
- Número de huéspedes (validado contra min/max del paquete)

**Cálculo de precio:**
```typescript
const amount = pkg.price_base * guests
```

**Validaciones:**
- Usuario debe estar autenticado (redirige a `/login` si no)
- Check-in debe ser fecha futura
- Check-out debe ser posterior a check-in
- Huéspedes entre min y max del paquete

### 3. Crear Booking y Sesión de Stripe

**Endpoint**: [POST /api/checkout](app/api/checkout/route.ts)

**Request Body:**
```json
{
  "packageId": "uuid",
  "checkin": "2025-12-01",
  "checkout": "2025-12-05",
  "guests": 2,
  "amount": 50000
}
```

**Proceso:**

1. **Validación de autenticación**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return 401
   ```

2. **Validación del paquete**
   ```typescript
   const { data: pkg } = await supabase.from("pkg_packages").select("*").eq("id", packageId)
   if (pkg.booking_mode !== "payment") return 400
   ```

3. **Creación de booking con status "pending"**
   ```sql
   INSERT INTO bookings (package_id, user_id, checkin, checkout, guests, amount, currency, status)
   VALUES (uuid, uuid, date, date, int, decimal, 'MXN', 'pending')
   ```

4. **Creación de Stripe Checkout Session**
   ```typescript
   const session = await stripe.checkout.sessions.create({
     mode: "payment",
     currency: "mxn",
     line_items: [{ ... }],
     metadata: { booking_id, package_id, user_id },
     customer_email: user.email,
     success_url: "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
     cancel_url: "/packages/{slug}?canceled=true"
   })
   ```

5. **Creación de payment record**
   ```sql
   INSERT INTO payments (booking_id, stripe_session_id, amount, currency, status)
   VALUES (uuid, 'cs_...', decimal, 'MXN', 'pending')
   ```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/...",
  "bookingId": "uuid"
}
```

### 4. Redirección a Stripe Checkout

**Cliente**:
```typescript
const stripe = await loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
await stripe.redirectToCheckout({ sessionId })
```

**Stripe Checkout Page:**
- Formulario de pago seguro
- Soporte para tarjetas de crédito/débito
- Validación 3D Secure
- Currency: MXN

### 5. Webhook de Stripe (Pago Completado)

**Endpoint**: [POST /api/stripe/webhook](app/api/stripe/webhook/route.ts)

**Evento**: `checkout.session.completed`

**Proceso:**

1. **Verificación de firma**
   ```typescript
   const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
   ```

2. **Extracción de metadata**
   ```typescript
   const bookingId = session.metadata?.booking_id
   ```

3. **Actualización de payment**
   ```sql
   UPDATE payments SET
     status = 'succeeded',
     stripe_payment_intent_id = 'pi_...',
     raw = {...},
     updated_at = NOW()
   WHERE stripe_session_id = 'cs_...'
   ```

4. **Actualización de booking a "confirmed" (paid)**
   ```sql
   UPDATE bookings SET
     status = 'confirmed',
     metadata = jsonb_set(metadata, '{paid_at}', '"2025-11-08T..."'),
     updated_at = NOW()
   WHERE id = booking_id
   ```

5. **Logs**
   ```
   Payment succeeded for booking {bookingId}
   Booking status updated to "confirmed" (paid)
   ```

### 6. Página de Éxito

**URL**: `/checkout/success?session_id=cs_test_...`

**Página**: [/checkout/success](app/checkout/success/page.tsx)

**Proceso:**

1. **Recuperar datos de Stripe**
   ```typescript
   const session = await stripe.checkout.sessions.retrieve(sessionId)
   ```

2. **Recuperar datos de Supabase**
   ```typescript
   const payment = await supabase
     .from("payments")
     .select("*, booking:bookings(*, package:pkg_packages(*), user:profiles(*))")
     .eq("stripe_session_id", sessionId)
     .single()
   ```

3. **Mostrar recibo**
   - ✅ Confirmación visual (check verde)
   - 📋 Número de confirmación
   - 🏨 Detalles del paquete con imagen
   - 📅 Fechas de check-in/out
   - 👥 Número de huéspedes
   - 💳 Detalles del pago
   - 📧 Email de confirmación
   - 🎯 Próximos pasos

**Información mostrada:**
- Estado: "Confirmada" (badge verde)
- Número de confirmación: `BOOKING_ID.slice(0, 8).toUpperCase()`
- Imagen del paquete
- Título y destino
- Check-in / Check-out
- Número de huéspedes
- Email del cliente
- Monto total pagado
- ID de transacción Stripe
- Próximos pasos (3 pasos explicados)
- Botones de acción (Volver, Ver más paquetes, Descargar recibo)

## 🗄️ Estados de Booking

| Estado | Descripción | Cuándo |
|--------|-------------|--------|
| `pending` | Creado, esperando pago | Al crear booking en `/api/checkout` |
| `confirmed` | Pago completado (PAID) | Después del webhook `checkout.session.completed` |
| `cancelled` | Cancelado por usuario/admin | Manualmente |
| `completed` | Viaje completado | Después de check-out |

## 💳 Estados de Payment

| Estado | Descripción | Cuándo |
|--------|-------------|--------|
| `pending` | Esperando pago | Al crear payment en `/api/checkout` |
| `succeeded` | Pago exitoso | Webhook `checkout.session.completed` |
| `failed` | Pago fallido | Webhook `checkout.session.expired` |
| `refunded` | Reembolsado | Webhook `charge.refunded` |

## 🔐 Seguridad

### Webhook Signature Verification

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

**IMPORTANTE**:
- Nunca confiar en datos sin verificar firma
- Usar Service Role Key en webhook (bypasea RLS)
- Validar metadata de Stripe

### Autenticación de Usuario

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401
```

### Validación de Modo de Pago

```typescript
if (pkg.booking_mode !== "payment") {
  return 400 // No permite pago directo
}
```

## 📊 Metadata Almacenada

### Booking Metadata

```json
{
  "created_from": "checkout_flow",
  "created_at": "2025-11-08T...",
  "paid_at": "2025-11-08T...",
  "stripe_payment_intent_id": "pi_..."
}
```

### Stripe Metadata

```json
{
  "booking_id": "uuid",
  "package_id": "uuid",
  "user_id": "uuid"
}
```

## 🧪 Testing

### Desarrollo Local

1. **Configurar Stripe CLI**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Copiar webhook secret**
   ```bash
   # Output: whsec_...
   # Añadir a .env: STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Tarjetas de prueba**
   - Éxito: `4242 4242 4242 4242`
   - Fallo: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Verificar Flujo

1. Crear paquete con `booking_mode="payment"`
2. Ir a `/packages/{slug}`
3. Clic "Reservar Ahora"
4. Llenar formulario (check-in, check-out, huéspedes)
5. Usar tarjeta de prueba
6. Completar pago
7. Verificar redirección a `/checkout/success`
8. Verificar booking status = "confirmed"
9. Verificar payment status = "succeeded"

## 🚨 Errores Comunes

### Error: "Invalid signature"

- Webhook secret incorrecto
- Usar Stripe CLI en desarrollo
- Verificar STRIPE_WEBHOOK_SECRET en producción

### Error: "Booking not found"

- Booking_id en metadata de Stripe está vacío
- Verificar que se guarda correctamente en paso 3

### Error: "This package does not support direct payment"

- Paquete con `booking_mode != "payment"`
- Cambiar a "payment" en admin o crear nuevo paquete

## 📈 Próximas Mejoras

- [ ] Email de confirmación automático
- [ ] Generación de PDF del recibo
- [ ] Calendario de disponibilidad
- [ ] Descuentos y cupones
- [ ] Pagos parciales / depósitos
- [ ] Multi-moneda (USD, EUR)
- [ ] Reembolsos desde admin panel

---

**Flujo de Checkout** implementado completamente y listo para producción con Stripe en MXN.
