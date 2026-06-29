# 🏋️ GymLog — Bitácora de Entrenamiento

PWA para registrar y analizar tu progreso en el gimnasio. Construida con Next.js 14, TypeScript, Prisma, Tailwind CSS y Google Drive.

## 🚀 Despliegue rápido en Vercel

1. Haz fork/clone de este repositorio a tu GitHub
2. Conéctalo a [Vercel](https://vercel.com/new)
3. Configura las variables de entorno (ver abajo)
4. Deploy ✨

## 📦 Requisitos previos

- Node.js 18+
- Cuenta en [MongoDB Atlas](https://mongodb.com/atlas) (cluster M0 gratuito)
- Proyecto en [Google Cloud Console](https://console.cloud.google.com) con Drive API habilitada
- Cuenta en [Vercel](https://vercel.com) para despliegue

## 🔧 Configuración local

```bash
# 1. Clonar
git clone <repo-url>
cd gymlog

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores reales

# 4. Sincronizar base de datos
npx prisma db push

# 5. Generar cliente Prisma
npx prisma generate

# 6. Iniciar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 🌐 Configurar Google Drive

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita **Google Drive API**
4. Ve a **APIs & Services > Credentials**
5. Crea **OAuth 2.0 Client ID** (tipo: Web application)
6. Añade redirect URIs:
   - `http://localhost:3000/api/drive/callback` (desarrollo)
   - `https://tu-dominio.vercel.app/api/drive/callback` (producción)
7. Copia `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` a tu `.env`

## 🗄️ Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://mongodb.com/atlas) y crea una cuenta
2. Crea un **cluster M0** (gratuito) en la región que prefieras
3. En **Security > Database Access**: crea un usuario y contraseña
4. En **Security > Network Access**: agrega `0.0.0.0/0` para acceso desde Vercel
5. En **Connect > Drivers**: selecciona **Prisma** y copia la connection string
6. Reemplaza `<user>`, `<pass>` y `<cluster>` con tus datos

La URL de conexión será algo como:
`mongodb+srv://usuario:password@cluster0.mongodb.net/gymlog?retryWrites=true&w=majority`

## 🔐 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión MongoDB Atlas |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `GOOGLE_CLIENT_ID` | Client ID de OAuth 2.0 de Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret de OAuth 2.0 de Google |
| `GOOGLE_REDIRECT_URI` | URL de callback OAuth |
| `ENCRYPTION_KEY` | Clave de 32 caracteres para AES-256-GCM |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app |

## 🎨 Iconos PWA

Reemplaza los placeholders en `public/icons/` con iconos reales:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Usa [maskable.app](https://maskable.app/editor) para generar iconos correctos.

## 🏗️ Estructura del proyecto

```
gymlog/
├── prisma/schema.prisma      # Modelo de datos
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # Íconos PWA
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Layout raíz
│   │   ├── page.tsx          # Página principal (protegida)
│   │   ├── login/page.tsx    # Inicio de sesión
│   │   ├── register/page.tsx # Registro
│   │   └── api/              # API Routes
│   │       ├── auth/         # Autenticación (JWT)
│   │       └── drive/        # Google Drive (OAuth + CRUD)
│   ├── components/           # Componentes React
│   ├── hooks/                # Hooks personalizados
│   ├── lib/                  # Utilidades (Prisma, JWT, cifrado)
│   └── types/                # Tipos TypeScript
├── .env.example              # Plantilla de variables
├── next.config.js            # Config Next.js + PWA
└── tailwind.config.ts        # Config Tailwind (tema oscuro)
```

## ✨ Funcionalidades

- ✅ Registro/inicio de sesión con email y contraseña
- ✅ CRUD de días de entrenamiento y ejercicios
- ✅ Registro de series con peso y repeticiones reales
- ✅ Guardado automático en Google Drive
- ✅ Temporizador de descanso con vibración y notificación
- ✅ Gráficos de progreso (peso máximo + reps máximas)
- ✅ PWA instalable en Android
- ✅ Funcionamiento offline con Service Worker
- ✅ Interfaz oscura optimizada para móviles
