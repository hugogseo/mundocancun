# Mundo Cancún - Agencia de Viajes

Plataforma web completa para agencia de viajes especializada en Cancún y la Riviera Maya, construida con Next.js 15, Supabase y Stripe.

## 🚀 Características

- **Frontend moderno**: Next.js 15 con App Router, TypeScript, Tailwind CSS y shadcn/ui
- **Autenticación**: Sistema completo con Supabase Auth (Email/Password)
- **Base de datos**: PostgreSQL con Supabase y Row Level Security (RLS)
- **Pagos**: Integración con Stripe Checkout (MXN)
- **Chat en tiempo real**: Integración con N8N vía webhook
- **Panel de administración**: CRUD completo para paquetes, cotizaciones, reservas y pagos
- **Optimizado para SEO**: Server-side rendering y metadata dinámica
- **Diseño responsivo**: Mobile-first con animaciones suaves (Framer Motion)

## 📋 Requisitos Previos

- Node.js 18+ y npm/pnpm/yarn
- Cuenta de Supabase (gratuita)
- Cuenta de Stripe (modo test)
- Webhook N8N configurado (opcional para chat)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y completa las variables con tus credenciales.

### 3. Configurar Supabase

1. Ve a SQL Editor en tu proyecto de Supabase
2. Copia todo el contenido de `supabase/schema.sql`
3. Ejecuta el SQL (esto creará todas las tablas, índices, políticas RLS y funciones)

### 4. Poblar datos de ejemplo (opcional)

```bash
npm run seed
```

### 5. Configurar Stripe Webhooks (para desarrollo)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🏃 Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

```
mundocancun/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── packages/            # Listado y detalle de paquetes
│   ├── articles/            # Blog
│   ├── contact/             # Formulario de contacto
│   ├── admin/               # Panel de administración (protegido)
│   └── api/                 # API Routes (checkout, webhook, chat)
├── components/              # Componentes React
│   ├── ui/                  # Componentes shadcn/ui
│   └── ...                  # Componentes de aplicación
├── lib/                     # Utilidades
│   ├── supabase/            # Clientes de Supabase
│   └── utils.ts             # Funciones auxiliares
├── types/                   # Tipos TypeScript
│   └── database.types.ts    # Tipos de Supabase
├── supabase/                # Configuración de Supabase
│   └── schema.sql           # Schema completo con RLS
└── scripts/                 # Scripts de utilidad
    └── seed.ts              # Seed de datos de ejemplo
```

## 🔐 Seguridad

- **Row Level Security (RLS)** configurado en todas las tablas
- Middleware protege rutas `/admin/*`
- Verificación de roles (admin/editor)

## 💳 Flujo de Pagos (Stripe)

1. Usuario selecciona paquete con `booking_mode="payment"`
2. Se crea booking con `status="pending"`
3. Cliente llama a `/api/checkout` con `bookingId`
4. Stripe crea sesión de pago
5. Usuario completa el pago
6. Webhook actualiza `payments.status="succeeded"` y `bookings.status="confirmed"`

## 🎯 Modos de Reserva

- **`inquiry`**: Solo solicitar información
- **`quote`**: Solicitar cotización personalizada
- **`payment`**: Pago directo con Stripe

---

**Mundo Cancún** - Creado con Next.js, Supabase y Stripe
