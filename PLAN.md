# WebMarcial — Plan Completo del Proyecto

> Plataforma web para centralizar los deportes de contacto en España.
> Rankings de peleadores · Calendario de eventos por zonas · Directorio de gimnasios con leads y publicidad

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14+ (App Router) · TypeScript · Tailwind CSS |
| Backend / BD | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Pagos | Stripe |
| Email | Resend |
| Drag & Drop | @dnd-kit/core (editor de rankings admin) |
| UI | lucide-react · clsx · tailwind-merge · zod · slugify |

---

## Deportes (6 disciplinas)

- Muay Thai
- Kickboxing
- K1
- MMA
- Boxeo
- Jiu-Jitsu / Grappling

---

## Modelo de Negocio (Freemium)

| Plan | Precio | Características |
|---|---|---|
| **Free** | 0 €/mes | Perfil básico, hasta 5 peleadores, sin leads, 1 foto |
| **Basic** | ~29 €/mes | Formulario de leads (50/mes), galería 10 fotos, notificaciones email |
| **Pro** | ~79 €/mes | Leads ilimitados, badge "Destacado", posición prioritaria, analytics, exportar CSV, galería ilimitada |

Los gimnasios con plan **Pro** aparecen primeros en el directorio y en las búsquedas por zona.

---

## Zonas — Comunidades Autónomas

19 zonas preconfiguradas:

| Código | Nombre | Capital |
|---|---|---|
| AND | Andalucía | Sevilla |
| ARA | Aragón | Zaragoza |
| AST | Asturias | Oviedo |
| BAL | Islas Baleares | Palma |
| CAN | Canarias | Las Palmas |
| CNT | Cantabria | Santander |
| CLM | Castilla-La Mancha | Toledo |
| CYL | Castilla y León | Valladolid |
| CAT | Cataluña | Barcelona |
| EXT | Extremadura | Mérida |
| GAL | Galicia | Santiago de Compostela |
| LRJ | La Rioja | Logroño |
| MAD | Comunidad de Madrid | Madrid |
| MUR | Región de Murcia | Murcia |
| NAV | Navarra | Pamplona |
| PVA | País Vasco | Vitoria-Gasteiz |
| VAL | Comunitat Valenciana | Valencia |
| CEU | Ceuta | Ceuta |
| MEL | Melilla | Melilla |

---

## Base de Datos — Esquema Completo

### Tablas de referencia

**sports** — Los 6 deportes
```
id, name, slug, description, image_url, is_active
```

**weight_classes** — Categorías de peso por deporte y género
```
id, sport_id, name, slug, min_weight_kg, max_weight_kg, gender, sort_order
```

**zones** — 17 CCAA + Ceuta + Melilla
```
id, name, slug, code, capital, parent_id (provincia→CCAA), is_active
```

### Usuarios

**profiles** — Extiende auth.users de Supabase
```
id (FK auth.users), role (admin|gym_owner|public), full_name, avatar_url, phone
```

### Gimnasios

**gyms**
```
id, owner_id (FK profiles), name, slug, description,
address, city, zone_id, phone, email, website,
instagram_url, facebook_url, logo_url, cover_image_url,
sports[] (array de slugs), is_verified, is_featured, is_active,
subscription_tier (free|basic|pro), subscription_expires_at,
stripe_customer_id, stripe_subscription_id, lat, lng
```

**gym_images** — Galería de fotos
```
id, gym_id, url, alt, sort_order
```

### Peleadores

**fighters**
```
id, gym_id (nullable), full_name, slug, nickname,
nationality, birth_date, zone_id, photo_url, bio,
is_active, is_verified
```

**fighter_sport_profiles** — Récord por deporte + categoría de peso (muchos a muchos)
```
id, fighter_id, sport_id, weight_class_id,
wins, losses, draws, no_contests, is_active
UNIQUE(fighter_id, sport_id, weight_class_id)
```

### Títulos

**titles** — Definición de campeonatos
```
id, name, slug, sport_id, weight_class_id, zone_id (null=nacional),
scope (national|regional|international), organization (WBC, RFEDOCOM…)
```

**fighter_titles** — Historial de títulos por peleador
```
id, fighter_id, title_id, won_at, lost_at (null=actual campeón),
event_id, is_current
```

### Rankings

**rankings**
```
id, sport_id, weight_class_id, zone_id (null=nacional),
fighter_id, position, points, gender, season (2025, 2025-Q1…),
is_official, last_updated
UNIQUE(sport_id, weight_class_id, zone_id, fighter_id, season, gender)
```

### Eventos

**events**
```
id, name, slug, description, sport_ids[],
zone_id, city, venue, address, event_date, doors_open_at,
poster_url, ticket_url, organizer_name, organizer_contact,
gym_id (nullable), status (upcoming|live|completed|cancelled),
is_featured, is_verified
```

**fights** — Combates dentro de un evento
```
id, event_id, sport_id, weight_class_id,
fighter_red_id, fighter_blue_id, title_id (nullable),
scheduled_rounds, round_duration_minutes, order_in_card,
result (red_win|blue_win|draw|no_contest|pending),
method (KO|TKO|Decision|Submission…), round_ended, time_ended,
is_main_event
```

### Leads

**leads**
```
id, gym_id, name, email, phone, message,
sport_interest[], age_range, experience_level,
source (gym_profile|event_page|homepage),
status (new|contacted|converted|closed),
utm_source, utm_medium, utm_campaign
```

### Suscripciones

**subscription_plans**
```
id, name, slug (free|basic|pro), stripe_price_id,
price_monthly_eur, price_yearly_eur,
max_leads_per_month, is_featured, allow_advertising,
allow_gallery, allow_fighter_profiles, features (jsonb)
```

**subscription_events** — Log de webhooks Stripe
```
id, gym_id, stripe_event_id, event_type, payload (jsonb), processed_at
```

---

## Estructura del Proyecto

```
AppThai/
├── src/
│   ├── app/
│   │   ├── (public)/               ← Sin autenticación
│   │   │   ├── page.tsx            ← Homepage
│   │   │   ├── deportes/[sport]/
│   │   │   ├── rankings/[sport]/[zone]/
│   │   │   ├── eventos/[slug]/
│   │   │   ├── gimnasios/[slug]/
│   │   │   ├── luchadores/[slug]/
│   │   │   └── zonas/[zone]/
│   │   ├── (auth)/                 ← Login, registro, reset
│   │   ├── (gym-dashboard)/        ← Dashboard del gimnasio (protegido)
│   │   │   └── dashboard/
│   │   │       ├── perfil/
│   │   │       ├── luchadores/
│   │   │       ├── leads/
│   │   │       ├── eventos/
│   │   │       └── suscripcion/
│   │   ├── (admin)/                ← Panel admin (protegido)
│   │   │   └── admin/
│   │   │       ├── gimnasios/
│   │   │       ├── luchadores/
│   │   │       ├── rankings/
│   │   │       ├── eventos/
│   │   │       ├── titulos/
│   │   │       └── suscripciones/
│   │   └── api/
│   │       ├── leads/              ← POST: envío de formulario lead
│   │       └── webhooks/stripe/    ← Stripe webhook handler
│   ├── components/
│   │   ├── ui/                     ← Primitivos (Button, Card, Badge…)
│   │   ├── layout/                 ← Header, Footer, sidebars
│   │   ├── rankings/               ← RankingsTable, RankingsFilters
│   │   ├── events/                 ← EventCard, EventCalendar, FightCard
│   │   ├── gyms/                   ← GymCard, LeadCaptureForm ⭐
│   │   ├── fighters/               ← FighterCard, FighterRecord
│   │   ├── zones/                  ← SpainMap (SVG interactivo)
│   │   ├── dashboard/              ← Forms, LeadsTable, SubscriptionBanner
│   │   └── admin/                  ← DataTable, RankingsEditor (drag&drop)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Cliente browser
│   │   │   ├── server.ts           ← Cliente SSR (cookies)
│   │   │   └── admin.ts            ← Service role (solo servidor)
│   │   ├── stripe.ts
│   │   ├── constants.ts            ← Slugs de deportes, códigos de zonas
│   │   ├── formatters.ts
│   │   └── validations.ts          ← Schemas Zod
│   └── types/
│       ├── database.ts             ← Tipos generados por Supabase
│       └── index.ts
└── supabase/
    └── migrations/
        ├── 0001_initial_schema.sql
        ├── 0002_seed_sports.sql
        ├── 0003_seed_weight_classes.sql
        ├── 0004_seed_zones.sql
        ├── 0005_rls_policies.sql
        └── 0006_seed_subscription_plans.sql
```

---

## Rutas Públicas

| Ruta | Contenido | Cache |
|---|---|---|
| `/` | Homepage: eventos destacados, top fighters, deportes, gimnasios | ISR 1h |
| `/deportes` | Grid de los 6 deportes | SSG |
| `/deportes/[sport]` | Overview: rankings, eventos, gimnasios del deporte | ISR 1h |
| `/rankings` | Hub de rankings (selector deporte + zona + peso) | ISR 30m |
| `/rankings/[sport]` | Tabla filtrable por zona, peso, género | ISR 30m |
| `/rankings/[sport]/[zone]` | Rankings de una zona concreta | ISR 30m |
| `/eventos` | Calendario con filtros (deporte, zona, fecha) | ISR 15m |
| `/eventos/[slug]` | Evento: cartelera, venue, tickets | ISR 15m |
| `/eventos/zona/[zone]` | Eventos filtrados por zona | ISR 15m |
| `/gimnasios` | Directorio con búsqueda + filtros | ISR 1h |
| `/gimnasios/[slug]` | Perfil gimnasio + formulario de lead | ISR 30m |
| `/gimnasios/zona/[zone]` | Gimnasios de una zona | ISR 1h |
| `/luchadores` | Directorio de peleadores | ISR 1h |
| `/luchadores/[slug]` | Perfil: récord, rankings, títulos, gimnasio | ISR 30m |
| `/zonas` | Mapa SVG interactivo de España (CCAA) | SSG |
| `/zonas/[zone]` | Hub zona: eventos + rankings + gimnasios | ISR 1h |

## Rutas Dashboard Gimnasio (protegidas)

| Ruta | Función |
|---|---|
| `/dashboard` | Stats: leads recibidos, visitas al perfil, plan actual |
| `/dashboard/perfil` | Editar perfil, subir logo y fotos |
| `/dashboard/luchadores` | CRUD de peleadores del gimnasio |
| `/dashboard/leads` | Ver contactos recibidos (nombre, email, teléfono, deporte) |
| `/dashboard/suscripcion` | Plan actual, upgrade, portal de facturación Stripe |
| `/dashboard/eventos` | Enviar eventos para aprobación |

## Rutas Admin (protegidas, rol admin)

| Ruta | Función |
|---|---|
| `/admin` | Dashboard: stats globales de la plataforma |
| `/admin/deportes` | CRUD deportes |
| `/admin/pesos` | CRUD categorías de peso por deporte |
| `/admin/zonas` | Gestión de zonas |
| `/admin/gimnasios` | Listar, verificar, destacar, suspender gimnasios |
| `/admin/luchadores` | Verificar peleadores, asignar títulos, asignar gimnasio |
| `/admin/rankings` | Editor drag & drop de rankings por deporte/peso/zona |
| `/admin/eventos` | Aprobar/rechazar eventos, añadir cartelera de combates |
| `/admin/combates` | Añadir y editar resultados de combates |
| `/admin/titulos` | Definir títulos, asignar campeones actuales |
| `/admin/suscripciones` | Ver todas las suscripciones, anular, forzar plan |
| `/admin/leads` | Analytics de leads de toda la plataforma |

---

## Componentes Críticos

### `LeadCaptureForm.tsx` ⭐ (motor de monetización)
- Embebido en cada perfil de gimnasio público
- Solo renderiza el formulario si el gimnasio tiene plan Basic o Pro
- Plan Free: muestra teléfono/WhatsApp pero sin formulario rastreado
- Al enviar llama a `POST /api/leads`:
  - Verifica plan del gimnasio (rechaza si es Free)
  - Verifica cuota mensual (rechaza si Basic superó 50 leads)
  - Inserta en tabla `leads`
  - Dispara Edge Function para email al propietario del gimnasio
- El gym owner ve los leads en `/dashboard/leads`

### `RankingsTable.tsx`
- Server Component con filtros client-side
- Filtros por: deporte, zona, categoría de peso, género
- Filtros reflejados en URL params (shareables y SEO-friendly)
- Muestra: posición, foto, nombre (link), gimnasio, récord W/L/D, badges de títulos

### `SpainMap.tsx`
- SVG interactivo de las 17 CCAA
- Hover: nombre de zona + stats (nº eventos, nº gimnasios, top peleador)
- Click: navega a `/zonas/[slug]`
- Implementado con paths SVG y códigos de zona como IDs

### `RankingsEditor.tsx` (admin)
- Drag & drop con `@dnd-kit/core`
- Admin selecciona deporte + peso + zona + temporada
- Arrastra para reordenar posiciones
- Guarda batch update en tabla `rankings`

### `EventCalendar.tsx`
- Vista calendario + vista lista (toggle)
- Filtros: deporte (multi-select), zona, rango de fechas
- Eventos próximos destacados, pasados en muted
- Cada tarjeta: badge deporte, ciudad, nº combates, si es evento destacado

---

## Flujo de Monetización — Stripe

```
Gym owner (plan free)
    ↓  visita /dashboard/suscripcion
    ↓  elige plan Basic o Pro
    ↓  Server Action → stripe.checkout.sessions.create()
    ↓  redirect → Stripe Checkout (hosted)
    ↓  pago completado
    ↓  Stripe webhook → POST /api/webhooks/stripe
    ↓  handler verifica firma (stripe.webhooks.constructEvent)
    ↓  actualiza gyms.subscription_tier + subscription_expires_at
    ↓  gym owner regresa con plan activo
```

**Eventos Stripe a manejar:**
- `checkout.session.completed` → activar suscripción
- `invoice.paid` → renovación mensual
- `invoice.payment_failed` → email de aviso, grace period 3 días
- `customer.subscription.deleted` → revertir a plan Free

**Portal de facturación:**
Server Action → `stripe.billingPortal.sessions.create()` → redirect a portal Stripe (cancelar, cambiar plan, historial facturas)

---

## Row Level Security (RLS) — Supabase

```
Tabla          | Público        | Gym Owner              | Admin
---------------|----------------|------------------------|-------
sports         | SELECT         | —                      | ALL
weight_classes | SELECT         | —                      | ALL
zones          | SELECT         | —                      | ALL
gyms           | SELECT activos | INSERT/UPDATE (propio) | ALL
gym_images     | SELECT         | ALL (propio gym)       | ALL
fighters       | SELECT activos | ALL (propio gym)       | ALL
fighter_*      | SELECT         | ALL (propio gym)       | ALL
rankings       | SELECT         | —                      | ALL
events         | SELECT         | INSERT (pendiente)     | ALL
fights         | SELECT         | —                      | ALL
titles         | SELECT         | —                      | ALL
fighter_titles | SELECT         | —                      | ALL
leads          | INSERT only    | SELECT (propio gym)    | ALL
```

**Regla importante:** Las columnas `stripe_customer_id` y `stripe_subscription_id` nunca se exponen al cliente. Solo se leen en servidor (service role).

---

## Storage Buckets — Supabase

| Bucket | Acceso | Contenido |
|---|---|---|
| `gym-assets` | Público | logos/, covers/, gallery/ |
| `fighter-photos` | Público | fotos de peleadores |
| `event-posters` | Público | carteles de eventos |
| `admin-assets` | Público | iconos de deportes, imágenes de zonas |

Límites: logos 500KB · covers 2MB · galería 2MB/imagen · fighter photos 1MB

---

## Fases de Implementación

### Fase 0 — Fundación (Semana 1)
- [x] Next.js 14 inicializado (TypeScript + Tailwind + App Router)
- [x] Dependencias instaladas (Supabase, Stripe, dnd-kit, lucide, zod…)
- [x] Repositorio GitHub configurado
- [ ] Migraciones Supabase: schema completo + seeds (deportes, pesos, zonas, planes)
- [ ] Clientes Supabase: `client.ts`, `server.ts`, `admin.ts`
- [ ] `middleware.ts` para refresco de sesión
- [ ] Layout base: Header, Footer, providers (Supabase, ThemeProvider)
- [ ] Variables de entorno: `.env.local` con keys de Supabase y Stripe

### Fase 1 — Contenido Público (Semanas 2-3)
- [ ] Homepage con datos seed
- [ ] `/deportes` y `/deportes/[sport]`
- [ ] `/rankings` con filtros (URL params)
- [ ] `/eventos` calendario + `/eventos/[slug]`
- [ ] `/zonas` mapa SVG + `/zonas/[zone]`
- [ ] `/luchadores/[slug]` perfil
- [ ] `/gimnasios` directorio + `/gimnasios/[slug]` perfil
- [ ] SEO: `generateMetadata`, Open Graph, sitemap.xml, JSON-LD (Event, Person, LocalBusiness)
- [ ] ISR con `revalidate` configurado en cada página

### Fase 2 — Auth + Dashboard Gimnasio (Semanas 4-5)
- [ ] Páginas de registro y login con Supabase Auth
- [ ] Trigger BD: crear `profiles` automáticamente al registrarse
- [ ] Dashboard shell con sidebar
- [ ] `/dashboard/perfil`: form + upload de imágenes a Storage
- [ ] `/dashboard/luchadores`: CRUD de peleadores vinculados
- [ ] Protección de rutas en `middleware.ts`

### Fase 3 — Leads + Monetización (Semanas 6-7)
- [ ] Stripe: crear productos/precios en dashboard Stripe
- [ ] Seed `subscription_plans` con Stripe price IDs
- [ ] `/dashboard/suscripcion` con comparativa de planes + Checkout
- [ ] `/api/webhooks/stripe` handler completo
- [ ] `LeadCaptureForm` en perfiles de gimnasios
- [ ] `/api/leads` con validación de plan y cuotas
- [ ] `/dashboard/leads` vista de contactos
- [ ] Edge Function o Resend para emails de notificación de leads

### Fase 4 — Panel Admin (Semanas 8-9)
- [ ] Admin layout + guard de rol
- [ ] CRUD: deportes, categorías de peso, zonas
- [ ] Admin gimnasios: verificar, destacar, override suscripción
- [ ] Admin peleadores: verificar, asignar gimnasio, gestionar títulos
- [ ] `RankingsEditor` drag & drop
- [ ] Admin eventos: aprobar, añadir cartelera de combates
- [ ] Admin títulos: definir y asignar campeones

### Fase 5 — Rendimiento y Producción (Semana 10)
- [ ] `generateStaticParams` para rutas de alto tráfico
- [ ] `next/image` en todo el proyecto
- [ ] Loading skeletons y error boundaries
- [ ] sitemap.xml dinámico desde BD
- [ ] Core Web Vitals / Lighthouse 90+
- [ ] Audit mobile responsive

### Fase 6 — Mejoras Futuras (Post-lanzamiento)
- [ ] Blog/artículos por deporte
- [ ] Herramienta de comparación de peleadores
- [ ] Notificaciones: nuevo evento en tu zona, actualización de ranking
- [ ] Analytics avanzado para gimnasios (visitas al perfil, tasa de conversión de leads)
- [ ] PWA (Progressive Web App)
- [ ] Soporte multiidioma (es/ca/eu/gl)

---

## Archivos Críticos

| Archivo | Por qué es crítico |
|---|---|
| `supabase/migrations/0001_initial_schema.sql` | Schema fundacional — errores aquí son caros de corregir |
| `src/lib/supabase/server.ts` | Todos los Server Components dependen de este para auth y RLS |
| `src/app/api/webhooks/stripe/route.ts` | Columna vertebral de la monetización |
| `src/components/gyms/LeadCaptureForm.tsx` | Widget de conversión Free → Pago |
| `src/app/(gym-dashboard)/dashboard/suscripcion/page.tsx` | Página de upgrade — donde ocurre la conversión |
| `middleware.ts` | Protege todas las rutas privadas |

---

## Variables de Entorno Necesarias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Repositorio

- **GitHub:** https://github.com/alexpinieste-beep/webmarcial
- **Rama estable:** `master`
- **Convención de ramas:** `feat/nombre-feature`, `fix/nombre-bug`
