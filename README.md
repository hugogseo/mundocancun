# Mundo Cancún - Travel Agency Platform

Plataforma moderna de agencia de viajes especializada en Cancún y la Riviera Maya, construida con Next.js 15, TypeScript, Supabase y Stripe.

## 🚀 Características

- ✅ **Homepage moderna** con diseño inspirado en las mejores agencias de viajes
- ✅ **Gestión de paquetes** turísticos con reservas instantáneas y cotizaciones
- ✅ **Panel de administración** completo para gestionar paquetes, reservas, pagos
- ✅ **Sistema de pagos** integrado con Stripe (MXN)
- ✅ **Base de datos** Supabase con autenticación y RLS
- ✅ **Chat en vivo** con integración N8N (opcional)
- ✅ **Responsive design** optimizado para móvil, tablet y desktop

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Deployment**: Vercel

## 📦 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/YOUR_USERNAME/mundocancun.git
cd mundocancun
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales reales.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

## 🌐 Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Variables de entorno requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📄 Licencia

MIT
