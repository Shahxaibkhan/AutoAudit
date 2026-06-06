# AutoAuditAI — Complete Implementation Reference

> This document captures every feature built, how it works, and where the code lives.
> For deferred and future features, see BACKLOG.md.
> Last updated: June 2026

---

## 🔐 Auth & Onboarding

| Feature | Implementation | Key Files |
|---|---|---|
| Email + password signup | bcryptjs hash (cost 12), creates User with `plan: TRIAL`, `creditsTotal: 3` | `src/app/api/auth/register/route.ts` |
| Email verification | 32-byte hex token → `VerificationToken` table → Resend email → `GET /api/auth/verify-email` validates + sets `emailVerified`. Login blocked until verified | `src/app/api/auth/verify-email/route.ts`, `src/app/(auth)/check-email/page.tsx` |
| Login + JWT session | NextAuth v4 CredentialsProvider + JWT strategy. Session refreshes on `trigger: 'update'` | `src/lib/auth.ts` |
| Password reset | 1hr token → Resend email → `POST /api/auth/reset-password` validates + bcrypt hash update | `src/app/api/auth/forgot-password/`, `src/app/(auth)/reset-password/page.tsx` |
| Rate limiting | In-memory Map in auth.ts — 5 attempts per email per 15 min | `src/lib/auth.ts` |
| Strong passwords | 12-char min + top-20 common password blocklist | `src/app/api/auth/register/route.ts` |
| ToS checkbox | Required checkbox → `tosAcceptedAt: DateTime` on User | `src/app/(auth)/register/page.tsx` |
| Industry selection | Dropdown → `industry: String` on User | `src/app/(auth)/register/page.tsx` |
| Block/unblock | `isBlocked: Boolean` on User. Auth throws `account_blocked` | `src/lib/auth.ts`, `src/app/api/admin/update-user/route.ts` |
| Resend verification | `POST /api/auth/resend-verification` → deletes old token, sends new | `src/app/api/auth/resend-verification/route.ts` |

---

## 📹 Video Capture

| Feature | Implementation | Key Files |
|---|---|---|
| Full-screen recording | `position: fixed; inset: 0` overlay as early return before page layout | `src/app/(dashboard)/inspections/[id]/capture/page.tsx` |
| Checklist | `CHECKLIST` array — 6 items shown before camera opens | Same |
| iOS support | `isIOS()` → hidden `<input type="file" accept="video/*" capture="environment">` → native iOS camera → same extraction pipeline | Same |
| Landscape enforcement | `window.innerHeight > window.innerWidth` on mount. Start Recording disabled + warning if portrait | Same |
| Shake detection | `DeviceMotionEvent` listener. Warns if acceleration delta > 7 m/s² | Same |
| Brightness monitor | 80×60 canvas sampling every 1s during recording | Same |
| Direction guidance | `WALKAROUND_STEPS` time-ranges. 4-dot progress + current step hint overlay | Same |
| Video compression | `videoBitsPerSecond: 1_500_000` (1.5Mbps). Resolution cap `1280×720` | Same |
| Frame extraction | `extractFrames(blob, 35)` — seeks through video at intervals | Same |
| Android Infinity duration fix | Seeks to `1e101` to force WebM parser to compute real duration | Same |
| Brightness filter | Skips frames < 25 or > 235 brightness | Same |
| Sharpness filter (Laplacian) | Laplacian variance on 160×90 canvas. Skips score < 12/100 | Same |
| pHash deduplication | dHash 17×16 canvas (256-bit). Hamming distance < 12 = near-duplicate dropped | Same |
| Temporal window selection | Divides timeline into N windows, picks sharpest frame per window | Same |
| Upload progress | `uploadProgress: { current, total }` — shows "Uploading 8 / 35…" | Same |
| Retry on failure | `uploadFailed` state + red "Retry Upload" button. Frames kept in memory | Same |

---

## 📷 Photo Capture

| Feature | Implementation | Key Files |
|---|---|---|
| 8-angle SVG guide | `AngleGuideSVG` — top-down car with camera position + highlighted panel. Defined by `camX/camY/highlight` per angle | `src/app/(dashboard)/inspections/[id]/capture/page.tsx` |
| Numbered angle badges | 1–8 badges, green checkmark when done | Same |
| Quality check | `checkPhotoQuality(file)` — brightness + Laplacian on 160×90 canvas. Hard block or soft warning | Same |
| Retake UX | "Retake" amber button on hover → removes photo + switches to that angle | Same |
| Optional close-ups | Unlocks after all 8 done. Separate `closeupInputRef`. Up to 8 extra shots | Same |

---

## 🤖 AI Pipeline

| Feature | Implementation | Key Files |
|---|---|---|
| Provider auto-selection | `ai-provider.ts` — Gemini if `ANTHROPIC_API_KEY` empty + `GOOGLE_AI_KEY` set; else Claude | `src/lib/ai-provider.ts` |
| Gemini 2.5 Flash | `@google/generative-ai` SDK. Strips markdown fences before JSON parse | `src/lib/gemini.ts` |
| Claude Haiku/Sonnet | `@anthropic-ai/sdk`. Haiku for analysis, Sonnet for verification + report | `src/lib/claude.ts` |
| Direct analysis (no YOLO) | `analyzeFrameDirect()` per frame. Returns damages with panelCode + confidence | `src/lib/pipeline.ts` |
| Repaint detection | Prompt: color mismatch, overspray on seals, texture inconsistency. Type: `repaint` | `src/lib/claude.ts`, `src/lib/gemini.ts` |
| Panel misalignment | Prompt: uneven gaps, panel not flush. Type: `panel_misalignment` | Same |
| Rim damage | Prompt: metal alloy face only (not tyre). Type: `rim_damage`. Panels: `*_wheel` | Same |
| Headlight clarity | Prompt: yellowing, fogging, UV oxidation. Type: `headlight_fog`. Panels: `*_headlight` | Same |
| Multi-frame consensus | Groups by `panelCode::type`. Filters: skip `other`, require 2+ sightings for 10+ frames, conf ≥ 0.75 single | `src/lib/pipeline.ts` |
| Real quality score | `coverageScore(50%) + frameScore(30%) + avgConfidence(20%)` | Same |
| Email on completion | Sends Resend email with grade + "Review Findings" link (non-blocking) | `src/app/api/analyze/route.ts`, `src/lib/email.ts` |

---

## ✍️ Dual-Signature Workflow

| Feature | Implementation | Key Files |
|---|---|---|
| Status flow | `PENDING → IN_PROGRESS → PENDING_OWNER_REVIEW → PENDING_CUSTOMER_REVIEW → LOCKED/DISPUTED` | `prisma/schema.prisma` |
| Owner review page | Severity-grouped damage cards. Severe expanded, moderate/minor collapsed with bulk confirm | `src/app/(dashboard)/inspections/[id]/review/page.tsx` |
| Confirm/Edit/Remove | `PATCH /api/inspections/[id]/damages/[damageId]`. Preserves `originalDescription` on edit | `src/app/api/inspections/[id]/damages/[damageId]/route.ts` |
| Bulk confirm | `POST /api/inspections/[id]/bulk-confirm` — single DB transaction for all damages of a severity | `src/app/api/inspections/[id]/bulk-confirm/route.ts` |
| Owner adds damage | `POST /api/inspections/[id]/damages` — new damage with `OWNER_ADDED` state | `src/app/api/inspections/[id]/damages/route.ts` |
| Owner sign | `POST /api/inspections/[id]/owner-sign` → auto-confirms remaining → generates `shareToken (UUID)` → `PENDING_CUSTOMER_REVIEW` | `src/app/api/inspections/[id]/owner-sign/route.ts` |
| Public customer review | `/review/[token]` — no login needed. Token expires 7 days | `src/app/review/[token]/page.tsx`, `src/app/api/public/review/` |
| Customer agree/dispute | `PATCH /api/public/review/[token]/damages/[id]` → `CUSTOMER_CONFIRMED` or `CUSTOMER_DISPUTED` | Same |
| Customer sign + hash | `POST /api/public/review/[token]/sign` → SHA-256 of all signed data → `LOCKED` or `DISPUTED` | `src/app/api/public/review/[token]/sign/route.ts` |
| SHA-256 hash | Node `crypto.createHash('sha256')` on JSON of inspection + vehicle + damage states. Stored immutably | Same |
| Report shows signatures | Verification block with masked phones (+92***1234), timestamps, hash in monospace | `src/app/(dashboard)/inspections/[id]/report/page.tsx` |

---

## 📊 Reports

| Feature | Implementation | Key Files |
|---|---|---|
| Panel grouping | `groupByPanel()` + `PANEL_LABELS` covering 28 panel codes | `src/app/(dashboard)/inspections/[id]/report/page.tsx` |
| Letter grade circle | A–F with color ring + key showing all grades, current highlighted | Same |
| Photo lightbox | `LightboxImage` client component. Gallery with prev/next, keyboard nav, count | `src/components/LightboxImage.tsx` |
| PDF download | `DownloadReportButton` — html2canvas → jsPDF. Captures entire `#report-content` div | `src/components/DownloadReportButton.tsx` |
| B2C report titles | `inspectionReportTitle()` — "Pre-Purchase Vehicle Report", "Vehicle Condition Report" etc. | `src/lib/utils.ts` |
| Damage thumbnails | `imageUrl` shown as 80×60 thumbnail per damage card (source frame from analysis) | `src/app/(dashboard)/inspections/[id]/report/page.tsx` |
| Stale data warning | Banner if `damages.length > 10` with re-analyze link | Same |

---

## 🗂️ Inspection Types

| Group | Types |
|---|---|
| Single (B2C) | `JUST_CHECK`, `BUYER_INSPECTION`, `SELLER_INSPECTION`, `MY_CAR` |
| Before & After (B2B) | `PRE_RENTAL`, `POST_RENTAL`, `PRE_SALE`, `POST_SALE`, `SHIFT_START`, `SHIFT_END`, `PRE_CLAIM`, `POST_CLAIM`, `PRE_REPAIR`, `POST_REPAIR`, `LEASE_START`, `LEASE_END` |

B2C types hide party details, show custom report titles, BUYER_INSPECTION shows WhatsApp share button.

---

## 🛡️ Admin Panel

| Feature | Implementation | Key Files |
|---|---|---|
| Stats row | 6 cards: Total, Active trial, Trial expired, Paid, Sales, Active 7d | `src/app/(dashboard)/admin/page.tsx` |
| Search + filter | Client-side by name/email/business + plan tabs | Same |
| Gift credits / extend trial / grant sales / reset trial | `POST /api/admin/update-user` with action param | `src/app/api/admin/update-user/route.ts` |
| Block/unblock | `isBlocked` toggle. Blocked users see suspension message with WhatsApp number | Same |
| View user inspections | `/admin/users/[id]` — full inspection history with grade, status, counts | `src/app/(dashboard)/admin/users/[id]/page.tsx` |
| Failed inspections tab | `GET /api/admin/failed` — stuck `IN_PROGRESS > 30min` or abandoned `PENDING` | `src/app/api/admin/failed/route.ts` |

---

## 🌐 Landing Page

| Feature | Details |
|---|---|
| Pricing | PKR 5,000 / 15,000 / 30,000 / Custom per month |
| Stats | "8+ damage types", "3 min", "PKR 80k+", "100% mobile-first" |
| B2C/B2B inspection type selector | Grouped form with emoji labels |
| Sample report | `/sample-report` — public Toyota Corolla inspection with PDF download |
| WhatsApp button | +92-343-4994409 in hero + footer |
| FAQ section | 7 questions covering accuracy, privacy, mobile, PDF, pricing |

---

## 📈 Analytics & Monitoring

| Service | How set up |
|---|---|
| PostHog | `posthog-js` in `PostHogProvider.tsx` → `layout.tsx`. EU region. Activates on cookie consent accept + key set. Tracks page views, clicks, signups automatically |
| Sentry | `sentry.client.config.ts` + `sentry.server.config.ts`. Activates when `NEXT_PUBLIC_SENTRY_DSN` set |
| Cookie consent | `CookieBanner.tsx` in layout. Stores `cookie-consent` in localStorage |

---

## 📋 Data & Compliance

| Feature | Implementation |
|---|---|
| Terms of Service | `/terms` with AI liability disclaimer, limitation of liability |
| Privacy Policy | `/privacy` — data collected, third parties, retention, rights |
| Account deletion | Settings → type "DELETE" → `DELETE /api/user/account` → cascades all data |
| Cookie banner | Accept/Decline, persists in localStorage |

---

## 🎭 Demo System

| Feature | Implementation |
|---|---|
| 6 industry demos | `GET /api/demo/instant?industry=rental` — creates demo account + seeds data → auto-signs in |
| Demo accounts | `plan: SALES`, `creditsTotal: 999999`, `emailVerified: new Date()`. Email bypass in auth |
| Rental demo scenarios | Corolla (pre/post), Civic (clean return), Alto (`PENDING_OWNER_REVIEW`), Cultus (`LOCKED` with hash), Yaris (`BUYER_INSPECTION`) |

---

## 🔑 Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `RESEND_API_KEY` | Transactional emails (verification, reset, completion) |
| `GOOGLE_AI_KEY` | Gemini 2.5 Flash (free testing) |
| `ANTHROPIC_API_KEY` | Claude API (production) — takes priority over Gemini |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage for inspection photos |
| `ADMIN_EMAIL` | Comma-separated admin emails |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.posthog.com` for EU region |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring DSN |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Set to `0` locally for corporate SSL proxy. **Never add to Vercel** |

---

## 📁 Key File Structure

```
src/
├── app/
│   ├── (auth)/          # login, register, verify, forgot/reset password, check-email
│   ├── (dashboard)/     # dashboard, inspections, vehicles, billing, admin, settings
│   ├── (legal)/         # terms, privacy
│   ├── review/[token]/  # public customer review page (no auth)
│   ├── sample-report/   # public sample report
│   ├── demo/            # demo industry selector
│   └── api/
│       ├── auth/        # register, verify-email, forgot/reset-password, resend-verification
│       ├── inspections/ # CRUD + review + damages + bulk-confirm + owner-sign
│       ├── public/      # review/[token] — public customer review APIs
│       ├── analyze/     # AI analysis pipeline trigger
│       ├── compare/     # before/after comparison
│       ├── upload/      # photo/frame upload to Vercel Blob
│       ├── admin/       # users, update-user, failed inspections
│       ├── billing/     # usage, checkout, portal
│       ├── demo/        # instant demo account creation
│       └── user/        # account deletion
├── components/
│   ├── AppShell.tsx     # sidebar navigation
│   ├── LightboxImage.tsx # photo lightbox with gallery
│   ├── DeleteButton.tsx  # reusable delete with confirm
│   ├── CookieBanner.tsx  # GDPR cookie consent
│   ├── PostHogProvider.tsx # analytics wrapper
│   └── DownloadReportButton.tsx # PDF generation
├── lib/
│   ├── auth.ts          # NextAuth config + rate limiting + block check
│   ├── ai-provider.ts   # Claude/Gemini selector
│   ├── claude.ts        # Claude prompts + API calls
│   ├── gemini.ts        # Gemini prompts + API calls (mirrors claude.ts)
│   ├── pipeline.ts      # frame extraction → consensus → report
│   ├── email.ts         # Resend templates (verify, reset, completion)
│   ├── subscription.ts  # plan definitions, credit checks
│   └── utils.ts         # formatDate, inspectionTypeLabel, etc.
└── prisma/
    └── schema.prisma    # full DB schema
```
