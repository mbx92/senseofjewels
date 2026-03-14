# License Server — Architecture & Implementation Guide

Dokumen ini menjelaskan bagaimana membangun **License Server** terpisah untuk menggantikan sistem feature-flag berbasis database yang saat ini digunakan di CMS `usePlan.ts`.

---

## Latar Belakang

Saat ini, fitur premium (Shop, SEO, Theme) dikontrol lewat `SiteSetting` di database dan hanya bisa di-toggle oleh superadmin secara manual. Tujuan license server adalah:

- Menjual akses fitur premium per instalasi CMS
- Mengikat lisensi ke domain atau installation ID tertentu
- Memvalidasi secara otomatis (online check + local fallback)
- Memungkinkan model bisnis SaaS/per-klien

---

## Gambaran Arsitektur

```
┌─────────────────────┐        HTTP         ┌──────────────────────┐
│   Sense of Jewels   │ ──── /validate ────► │   License Server     │
│   CMS (Nuxt/Nitro)  │ ◄─── { features } ─ │   (Hono / Express)   │
└─────────────────────┘                      └──────────────────────┘
         │                                            │
   cache di DB/                                  PostgreSQL
   SiteSetting                                (licenses, plans)
   (TTL 24 jam)
```

Alur validasi:
1. CMS boot → server-side `usePlan()` membaca `licenseKey` dari env/settings
2. Nitro server route memanggil License Server dengan key + domain
3. License Server return daftar fitur yang aktif
4. CMS cache hasilnya di `SiteSetting` dengan TTL (fallback jika offline)

---

## License Server

### Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: [Hono](https://hono.dev) (ringan, TypeScript-first)
- **ORM**: Prisma 7
- **Database**: PostgreSQL
- **Auth admin**: JWT (untuk dashboard kelola lisensi)
- **Deploy**: Railway / Fly.io / VPS

### Struktur Direktori

```
license-server/
├── src/
│   ├── index.ts            # Entry point, Hono app
│   ├── routes/
│   │   ├── validate.ts     # POST /validate — cek lisensi
│   │   ├── licenses.ts     # CRUD lisensi (admin protected)
│   │   └── plans.ts        # CRUD plans/tiers (admin protected)
│   ├── middleware/
│   │   └── adminAuth.ts    # JWT guard untuk admin routes
│   └── lib/
│       └── prisma.ts       # Prisma client
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

### Prisma Schema

```prisma
model Plan {
  id          String     @id @default(cuid())
  name        String     @unique  // "starter" | "pro" | "agency"
  features    String[]             // ["shop", "seo", "theme"]
  price       Float
  createdAt   DateTime   @default(now())
  licenses    License[]

  @@map("plans")
}

model License {
  id          String    @id @default(cuid())
  key         String    @unique @default(cuid())  // license key dikirim ke klien
  domain      String                               // "senseofjewels.com"
  clientName  String
  clientEmail String
  planId      String
  plan        Plan      @relation(fields: [planId], references: [id])
  isActive    Boolean   @default(true)
  expiresAt   DateTime?
  lastSeenAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("licenses")
}
```

### API Endpoint: `POST /validate`

Request:
```json
{
  "licenseKey": "cld7x2...",
  "domain": "senseofjewels.com"
}
```

Response (200 OK):
```json
{
  "valid": true,
  "features": ["shop", "seo", "theme"],
  "plan": "pro",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

Response (403 Invalid):
```json
{
  "valid": false,
  "reason": "domain_mismatch"
}
```

Reason codes: `not_found` | `domain_mismatch` | `expired` | `inactive`

### Implementasi `validate.ts`

```typescript
import { Hono } from 'hono'
import prisma from '../lib/prisma'

const app = new Hono()

app.post('/validate', async (c) => {
  const { licenseKey, domain } = await c.req.json<{
    licenseKey: string
    domain: string
  }>()

  if (!licenseKey || !domain) {
    return c.json({ valid: false, reason: 'missing_fields' }, 400)
  }

  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
    include: { plan: true },
  })

  if (!license) return c.json({ valid: false, reason: 'not_found' }, 403)
  if (!license.isActive) return c.json({ valid: false, reason: 'inactive' }, 403)
  if (license.expiresAt && license.expiresAt < new Date()) {
    return c.json({ valid: false, reason: 'expired' }, 403)
  }

  // Normalisasi domain: strip www dan trailing slash
  const normalize = (d: string) => d.replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
  if (normalize(license.domain) !== normalize(domain)) {
    return c.json({ valid: false, reason: 'domain_mismatch' }, 403)
  }

  // Update lastSeenAt secara async (non-blocking)
  prisma.license.update({
    where: { id: license.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => {})

  return c.json({
    valid: true,
    features: license.plan.features,
    plan: license.plan.name,
    expiresAt: license.expiresAt,
  })
})

export default app
```

---

## Integrasi ke CMS

### 1. Environment Variable

Tambahkan ke `.env` CMS:
```env
NUXT_LICENSE_KEY="cld7x2..."
NUXT_LICENSE_SERVER_URL="https://license.senseofjewels.com"
```

`nuxt.config.ts`:
```typescript
runtimeConfig: {
  licenseKey: '',
  licenseServerUrl: '',
}
```

### 2. Server-side Validation (`server/utils/license.ts`)

```typescript
import { useRuntimeConfig } from '#imports'

interface LicenseResult {
  valid: boolean
  features: string[]
  plan?: string
  expiresAt?: string | null
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 jam
let cache: { result: LicenseResult; cachedAt: number } | null = null

export async function validateLicense(): Promise<LicenseResult> {
  // Kembalikan cache jika masih fresh
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return cache.result
  }

  const config = useRuntimeConfig()
  const { licenseKey, licenseServerUrl } = config

  if (!licenseKey || !licenseServerUrl) {
    return { valid: false, features: [] }
  }

  try {
    const domain = new URL(licenseServerUrl).hostname  // atau baca dari config
    const result = await $fetch<LicenseResult>(`${licenseServerUrl}/validate`, {
      method: 'POST',
      body: { licenseKey, domain },
      timeout: 5000,
    })

    cache = { result, cachedAt: Date.now() }

    // Simpan ke DB sebagai fallback offline
    await prisma.siteSetting.upsert({
      where: { key: '_licenseCache' },
      update: { value: JSON.stringify({ ...result, cachedAt: Date.now() }) },
      create: { key: '_licenseCache', value: JSON.stringify({ ...result, cachedAt: Date.now() }) },
    })

    return result
  } catch {
    // Fallback: baca dari DB cache
    const cached = await prisma.siteSetting.findUnique({ where: { key: '_licenseCache' } })
    if (cached) {
      return JSON.parse(cached.value) as LicenseResult
    }
    return { valid: false, features: [] }
  }
}
```

### 3. API Route (`server/api/license.get.ts`)

```typescript
import { validateLicense } from '../utils/license'

export default defineEventHandler(async () => {
  return validateLicense()
})
```

### 4. Update `usePlan.ts`

```typescript
export function usePlan() {
  // Ambil dari API route yang memanggil license server
  const { data: license } = useFetch<{ valid: boolean; features: string[] }>('/api/license')

  function hasFeature(name: FeatureName): boolean {
    return license.value?.features.includes(name) ?? false
  }

  return { hasFeature, license }
}
```

---

## Plan Tiers (Contoh)

| Plan       | Harga/bulan | Fitur                        |
|------------|-------------|------------------------------|
| **Starter** | Gratis      | Core CMS (sections, products, media) |
| **Pro**     | Rp 299.000  | + SEO & Social Sharing, Theme Customization |
| **Agency**  | Rp 599.000  | + Shop Page, semua fitur Pro |

---

## Security Checklist

- [ ] License Server di-deploy di domain terpisah (bukan di CMS itu sendiri)
- [ ] Endpoint `/validate` menggunakan HTTPS wajib
- [ ] Admin routes di License Server dilindungi JWT dengan expiry pendek (15 menit)
- [ ] Rate limit endpoint `/validate`: max 10 req/menit per IP
- [ ] Domain matching case-insensitive + strip `www.`
- [ ] License key tidak pernah di-log atau di-expose ke client-side
- [ ] `NUXT_LICENSE_KEY` hanya ada di env server, tidak di `public` runtime config
- [ ] Fallback DB cache tidak boleh dipakai lebih dari 7 hari (paksa re-validate)

---

## Development & Testing Lokal

```bash
# Clone dan setup License Server
git clone <license-server-repo>
cd license-server
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed   # Buat plan starter/pro/agency + 1 test license

# Jalankan
npm run dev  # port 4000

# Test validate
curl -X POST http://localhost:4000/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "test-key-123", "domain": "localhost"}'
```

Di `.env` CMS untuk dev:
```env
NUXT_LICENSE_KEY="test-key-123"
NUXT_LICENSE_SERVER_URL="http://localhost:4000"
```

---

## Roadmap

- [ ] License Server v1: validasi key + domain, return features
- [ ] Dashboard admin License Server (list lisensi, status, expiry)
- [ ] Email notifikasi 30 hari sebelum expired
- [ ] Webhook ke CMS saat lisensi dinonaktifkan
- [ ] Portal klien: self-service upgrade plan
- [ ] Offline grace period: 7 hari tanpa koneksi ke license server
