# Briefing: Panel de Administración — WebMarcial

> Este documento es para el colaborador que implementa la **Fase 4 (Panel Admin)**.
> Está escrito para que tanto el desarrollador como un LLM (Claude Code, Cursor, etc.)
> puedan retomar el trabajo con contexto completo.

---

## 1. El proyecto

**WebMarcial** es una plataforma web para centralizar los deportes de contacto en España.
Permite a aficionados, peleadores y gimnasios encontrar rankings, eventos y salas de
entrenamiento. Los gimnasios tienen perfil gratuito con opción de suscripción de pago.

**Deportes:** Muay Thai · Kickboxing · K1 · MMA · Boxeo · Jiu-Jitsu/Grappling

**Repo GitHub:** https://github.com/alexpinieste-beep/webmarcial  
**Rama principal:** `master`  
**Rama de trabajo:** crear `feat/admin-panel` desde `feat/project-setup`

---

## 2. Stack técnico

| Tecnología | Versión | Notas importantes |
|---|---|---|
| Next.js | **16.2.2** | `params` y `searchParams` son `Promise<...>` — siempre hacer `await` |
| React | 19.2.4 | |
| TypeScript | 5.x | |
| Tailwind CSS | **v4** | CSS-first config — NO existe `tailwind.config.js` |
| Supabase | @supabase/ssr ^0.10.0 | |
| lucide-react | ^1.7.0 | `Instagram` y `Facebook` NO existen — usar `AtSign` y `ExternalLink` |
| @dnd-kit/core | ^6.3.1 | Para el editor de rankings drag & drop |
| @dnd-kit/sortable | ^10.0.0 | |

### Breaking changes vs. versiones anteriores de Next.js

```typescript
// ✅ CORRECTO en Next.js 16
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// ❌ INCORRECTO (patrón antiguo Next.js 13/14)
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params  // Error en Next.js 16
}
```

> **IMPORTANTE:** Antes de escribir cualquier código, lee los docs de Next.js disponibles
> en el proyecto: `node_modules/next/dist/docs/`

---

## 3. Lo que ya está construido (no tocar)

### Estructura de archivos existentes

```
src/
  types/database.ts          ← Tipos TypeScript de todas las entidades de BD
  lib/
    utils.ts                 ← cn() utility (clsx + tailwind-merge)
    supabase/
      server.ts              ← Cliente Supabase para Server Components
      client.ts              ← Cliente Supabase para Client Components
      index.ts               ← Barrel exports
    queries/
      sports.ts              ← getAllSports(), getSportBySlug()
      zones.ts               ← getAllZones(), getZoneBySlug()
      gyms.ts                ← getGyms(), getGymBySlug(), getFeaturedGyms(), getGymsByZone(), getGymCount()
      fighters.ts            ← getTopFighters(), getFighterBySlug(), getFightersByGym()
      events.ts              ← getUpcomingEvents(), getEventBySlug(), getEventsByZone(), getPastEvents()
      rankings.ts            ← getRankings(), getWeightClassesBySport()
  components/
    layout/Header.tsx        ← Header público (no tocar)
    layout/Footer.tsx        ← Footer público (no tocar)
    cards/                   ← SportCard, GymCard, FighterCard, EventCard (no tocar)
    ui/Badge.tsx             ← Badge reutilizable (no tocar)
    ui/SectionHeader.tsx     ← SectionHeader reutilizable (no tocar)
    rankings/                ← RankingsTable, RankingsFilters (no tocar)
    events/                  ← EventsFilters, FightCard (no tocar)
    gyms/GymsFilters.tsx     ← (no tocar)
  proxy.ts                   ← Middleware/proxy Next.js 16 (no tocar)
  app/
    (public)/                ← Todas las rutas públicas (no tocar)
    (auth)/                  ← Login/registro — otro colaborador (no tocar)
    (gym-dashboard)/         ← Dashboard gimnasios — otro colaborador (no tocar)
    (admin)/                 ← ← ← TU ZONA DE TRABAJO
```

### Cómo usar el cliente Supabase

```typescript
// En Server Components y Route Handlers:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// En Client Components ('use client'):
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Cómo usar la utility cn()

```typescript
import { cn } from '@/lib/utils'
className={cn('base-class', condition && 'conditional-class', props.className)}
```

---

## 4. Base de datos (Supabase)

### Tablas disponibles

| Tabla | Descripción |
|---|---|
| `sports` | 6 deportes con slug |
| `weight_classes` | Categorías de peso por deporte y género |
| `zones` | 19 CCAA + Ceuta + Melilla |
| `profiles` | Usuarios (rol: admin / gym_owner / public) |
| `gyms` | Gimnasios con subscription_tier, is_verified, is_featured |
| `gym_images` | Galería de fotos de gimnasios |
| `fighters` | Peleadores con is_verified |
| `fighter_sport_profiles` | Récord por deporte + categoría de peso |
| `titles` | Definición de títulos (nacional/regional) |
| `fighter_titles` | Historial de títulos por peleador |
| `rankings` | Posición, puntos, temporada, zona |
| `events` | Eventos con status: draft/published/completed/cancelled |
| `fights` | Combates dentro de un evento |
| `leads` | Contactos captados por formularios de gimnasios |
| `subscription_plans` | Planes Free/Basic/Pro con stripe_price_id |
| `subscription_events` | Log de webhooks de Stripe |

### RLS (Row Level Security)

El admin tiene acceso total a todas las tablas. La función `is_admin()` en Supabase
verifica que `profiles.role = 'admin'` para el usuario autenticado.

Para operaciones de admin desde el servidor (Route Handlers, Server Actions), usar
el **service role key** si las RLS causan problemas:

```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## 5. Variables de entorno necesarias

El archivo `.env.local` ya existe en la raíz con las keys de Supabase configuradas.
Pide al owner del repo las credenciales de Stripe y Resend si las necesitas para
funcionalidades de admin avanzadas.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Diseño visual

El panel admin debe tener un aspecto **distinto** del sitio público — más utilitario,
tipo dashboard de gestión.

| Token | Valor |
|---|---|
| Fondo body | `#0a0a0a` |
| Sidebar | `#111111` |
| Superficie/card | `#18181b` |
| Borde | `#27272a` |
| Accent | `#dc2626` (rojo) |
| Texto principal | `#ededed` |
| Texto secundario | `#a1a1aa` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |

Usa Tailwind v4 directamente con valores `#hex` en className cuando no haya token.
NO crear `tailwind.config.js`.

---

## 7. Tu zona de trabajo: `src/app/(admin)/`

### Protección de rutas

El layout de admin ya existe en `src/app/(admin)/layout.tsx` como placeholder.
Actualízalo para que verifique que el usuario tiene `role = 'admin'` — si no,
redirigir a `/login`. Usa `createClient` del servidor para obtener el usuario.

```typescript
// Patrón de verificación de rol admin en layout
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()
if (profile?.role !== 'admin') redirect('/')
```

### Estructura de rutas a implementar

```
src/app/(admin)/
  layout.tsx                     ← Actualizar: verificación admin + sidebar
  admin/
    page.tsx                     ← Dashboard principal (stats generales)
    deportes/
      page.tsx                   ← Lista de deportes
      nuevo/page.tsx             ← Crear deporte
      [id]/editar/page.tsx       ← Editar deporte
    categorias/
      page.tsx                   ← Categorías de peso (por deporte)
      nueva/page.tsx
      [id]/editar/page.tsx
    zonas/
      page.tsx                   ← Lista de zonas
      [id]/editar/page.tsx
    gimnasios/
      page.tsx                   ← Lista con verificar/destacar/forzar suscripción
      [id]/page.tsx              ← Detalle del gimnasio
      [id]/editar/page.tsx
    luchadores/
      page.tsx                   ← Lista con verificar/asignar gimnasio
      [id]/page.tsx              ← Detalle del luchador
      [id]/editar/page.tsx
    rankings/
      page.tsx                   ← Editor drag & drop por deporte/peso/zona
    eventos/
      page.tsx                   ← Lista de eventos (aprobar/publicar)
      nuevo/page.tsx
      [id]/page.tsx              ← Detalle + cartelera
      [id]/editar/page.tsx
    titulos/
      page.tsx                   ← Gestión de títulos y campeones
      nuevo/page.tsx
      [id]/editar/page.tsx
    leads/
      page.tsx                   ← Vista global de todos los leads
    suscripciones/
      page.tsx                   ← Analytics de suscripciones activas
```

---

## 8. Especificaciones por sección

### 8.1 Layout del Admin (`layout.tsx`)

Sidebar fijo izquierdo (240px) + área de contenido.

**Secciones del sidebar:**
- Dashboard (icono: LayoutDashboard)
- **Contenido:** Deportes, Categorías, Zonas
- **Usuarios:** Gimnasios, Luchadores
- **Competición:** Rankings, Eventos, Títulos
- **Negocio:** Leads, Suscripciones
- Enlace "Ver sitio público" → `/`

### 8.2 Dashboard principal (`admin/page.tsx`)

Stats en cards:
- Total gimnasios / verificados / con plan de pago
- Total luchadores verificados
- Total eventos publicados / próximos
- Total leads (últimos 30 días)
- Ingresos estimados (suma de subscription_plans por tier activo)

Tablas de actividad reciente:
- Últimos 5 gimnasios registrados (con botón Verificar)
- Próximos 5 eventos

### 8.3 Gestión de Gimnasios (`admin/gimnasios/`)

**Lista (`page.tsx`):**
- Tabla con: nombre, zona, plan (badge), verificado (toggle), destacado (toggle), fecha registro
- Filtros: por zona, por plan, por estado (verificado/pendiente)
- Búsqueda por nombre
- Acciones rápidas: Verificar / Destacar / Ver perfil

**Detalle/Editar:**
- Formulario completo de edición del gimnasio
- Acción "Forzar suscripción" — cambiar tier manualmente sin pasar por Stripe
  (útil para cuentas de prueba o acuerdos manuales)
- Lista de luchadores vinculados
- Historial de leads recibidos

### 8.4 Gestión de Luchadores (`admin/luchadores/`)

**Lista:**
- Tabla con: nombre, gimnasio, deportes activos, verificado (toggle), fecha registro
- Filtros: por deporte, por gimnasio, verificado/pendiente

**Editar:**
- Datos básicos del luchador
- Asignar/cambiar gimnasio (select buscable)
- Gestionar fighter_sport_profiles (añadir/editar récord por deporte+peso)
- Asignar títulos actuales

### 8.5 Editor de Rankings (`admin/rankings/page.tsx`)

Esta es la funcionalidad más compleja. Usa `@dnd-kit/sortable`.

**Flujo:**
1. Seleccionar deporte (tabs o select)
2. Seleccionar categoría de peso y zona (Nacional o CCAA)
3. Cargar rankings actuales de esa combinación
4. Lista drag & drop para reordenar posiciones
5. Botón "Guardar orden" — actualiza `rankings.position` en Supabase para todos

**Patrón con @dnd-kit:**
```typescript
'use client'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
```

Cada item de la lista es un `SortableItem` que usa `useSortable({ id: ranking.id })`.
Al soltar (`onDragEnd`): actualizar el array local con `arrayMove`, luego en "Guardar"
hacer un bulk update en Supabase.

### 8.6 Gestión de Eventos (`admin/eventos/`)

**Lista:**
- Tabla con: título, deporte, zona, fecha, status (badge coloreado)
- Acciones: Publicar (draft→published) / Completar (published→completed) / Cancelar
- Filtros: por deporte, por zona, por status

**Crear/Editar evento:**
- Formulario: título, slug (auto-generado desde título con `slugify`), deporte, zona,
  venue, dirección, fecha, descripción, poster (upload a Supabase Storage)
- Sección "Cartelera": añadir/editar combates (fighter_a vs fighter_b, peso, resultado)
  - Los combates se pueden reordenar con drag & drop (sort_order)

### 8.7 Gestión de Títulos (`admin/titulos/`)

- CRUD de títulos (nombre, deporte, peso, zona/nacional, organización)
- Para cada título activo: asignar campeón actual (select de fighters)
- Historial: ver quién tuvo el título y cuándo

### 8.8 Leads (`admin/leads/page.tsx`)

Tabla global de todos los leads:
- Columnas: gimnasio, nombre, email, teléfono, mensaje, status, fecha
- Filtro por gimnasio y por status
- Cambiar status del lead (new → contacted → converted → closed)
- Exportar CSV (bonus)

### 8.9 Suscripciones (`admin/suscripciones/page.tsx`)

- Tabla de gimnasios con plan activo (Basic o Pro)
- Columnas: gimnasio, plan, fecha inicio, fecha expiración, stripe_customer_id
- Stats: cuántos en cada plan, ingresos mensuales estimados
- No integra con Stripe directamente — solo muestra datos guardados en BD

---

## 9. Server Actions vs Route Handlers

Para las mutaciones (crear, editar, eliminar), usar **Server Actions** de Next.js:

```typescript
// En el mismo archivo de la página o en un archivo separado actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyGym(gymId: string) {
  const supabase = await createClient()
  await supabase.from('gyms').update({ is_verified: true }).eq('id', gymId)
  revalidatePath('/admin/gimnasios')
  revalidatePath(`/gimnasios/${gymId}`)  // invalida también la caché pública
}
```

Después de cualquier mutación que afecte al sitio público, llama a `revalidatePath`
para invalidar la caché ISR de las páginas afectadas.

---

## 10. Componentes admin a crear

Crea estos en `src/components/admin/`:

| Componente | Descripción |
|---|---|
| `AdminTable.tsx` | Tabla reutilizable con columnas configurables, paginación, búsqueda |
| `AdminFormField.tsx` | Wrapper de campo de formulario con label y error |
| `StatusBadge.tsx` | Badge de status para eventos/leads/gimnasios |
| `ToggleButton.tsx` | Toggle on/off para verificado/destacado (optimistic UI) |
| `SortableRankingItem.tsx` | Item drag & drop para el editor de rankings |
| `ConfirmDialog.tsx` | Modal de confirmación para acciones destructivas |
| `ImageUpload.tsx` | Upload de imagen a Supabase Storage con preview |

---

## 11. Workflow de git

```bash
# Crear tu rama desde la rama de trabajo actual
git checkout feat/project-setup
git pull origin feat/project-setup
git checkout -b feat/admin-panel

# Trabajar en tus archivos (solo src/app/(admin)/ y src/components/admin/)
# Commits frecuentes con mensajes descriptivos

# Subir cambios
git push origin feat/admin-panel

# Cuando esté listo, abrir PR hacia feat/project-setup (NO hacia master)
```

### Reglas de no-conflicto

**Solo puedes modificar:**
- `src/app/(admin)/` — todas las páginas del admin
- `src/components/admin/` — componentes específicos del admin

**Puedes leer pero NO modificar:**
- `src/lib/queries/` — si necesitas una query que no existe, AÑADE una función nueva, no modifiques las existentes
- `src/types/database.ts` — si necesitas un tipo nuevo, AÑADE al final del archivo
- `src/components/ui/` — usa Badge y SectionHeader tal como están

**No tocar nunca:**
- `src/proxy.ts`
- `src/app/(public)/`
- `src/app/(auth)/`
- `src/app/(gym-dashboard)/`
- `src/lib/supabase/`

---

## 12. Arrancar en local

```bash
# Instalar dependencias (ya instaladas si clonaste el repo)
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con las keys de Supabase (pedir al owner del repo)

# Arrancar servidor de desarrollo
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin (tu zona)

# TypeScript check
npx tsc --noEmit

# Linting
npm run lint
```

---

## 13. Archivos críticos de referencia

Antes de empezar, lee estos archivos para entender el proyecto:

- `src/types/database.ts` — todos los tipos disponibles
- `src/lib/queries/gyms.ts` — ejemplo de cómo hacer queries Supabase
- `src/app/(public)/gimnasios/page.tsx` — ejemplo de página con searchParams en Next.js 16
- `src/app/(public)/rankings/[sport]/page.tsx` — ejemplo de página dinámica con generateStaticParams
- `supabase/migrations/0001_initial_schema.sql` — schema completo de la BD

---

*Cualquier duda sobre decisiones de arquitectura o negocio: consultar con el owner del repo.*
