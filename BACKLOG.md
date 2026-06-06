# AutoAuditAI — Feature Backlog

> This file tracks all deferred, partially built, and not-yet-implemented features.
> Update this file as features are completed or priorities change.
> Last updated: June 2026

---

## 🔴 HIGH PRIORITY — Build Soon

These are features with direct revenue or pitch impact.

### Reports & Trust
- [ ] **SHA-256 verification hash on report** — Pitch deck claims "tamper-proof, SHA-256 verified". Hash of `{inspectionId + vehicleId + damages + timestamp}`, stored in DB, shown on report and in PDF. ~2 hours.
- [ ] **Email notification on inspection completion** — Send email via Resend when AI analysis finishes. Template already designed. Just needs a trigger in `src/app/api/analyze/route.ts`. ~1 hour.
- [ ] **Negotiation price reduction for BUYER_INSPECTION** — Show `estimatedCostPKR` (already calculated by AI) as "estimated negotiation room" on BUYER_INSPECTION reports. Data exists, just needs UI. ~1 hour.

### Payments (needs Stripe keys configured in Vercel)
- [ ] **Stripe live subscription payments** — Code exists in `src/app/api/billing/`. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_PRO`, `STRIPE_WEBHOOK_SECRET` to Vercel. ~15 min setup.
- [ ] **Per-inspection B2C checkout (PKR 499–3,999)** — Separate from subscription. User buys 1 inspection credit. Needs new Stripe price IDs and a new checkout flow. ~1 day.

### Dual Signature Workflow (major differentiator)
- [ ] **Owner review screen after AI analysis** — After AI completes, owner sees each damage card and can confirm / edit / remove findings before sharing. Changes `inspection.status` from PENDING to PENDING_OWNER_REVIEW. ~2 days.
- [ ] **Customer shareable link (no login)** — Generate a unique `share_token` UUID. Public URL `/review/[token]` shows the inspection to the customer. ~1 day.
- [ ] **Simple signing flow** — Both owner and customer tap "I confirm" to lock the report. Sets `owner_signed_at` and `customer_signed_at`. No OTP needed at first. ~1 day.

---

## 🟡 MEDIUM PRIORITY — Build After First Customers

### Reports
- [ ] **Side-by-side before/after photo comparison** — For POST_RENTAL inspections, show pre and post photos side by side for each angle. Currently only shows damage list.
- [ ] **PDF includes verification hash** — Add SHA-256 hash to the PDF footer once hash generation is built.
- [ ] **PakWheels damage codes (A1, B2, U3 format)** — Map our damage types to the industry-standard PakWheels codes for B2B users familiar with that format.

### Customer Experience
- [ ] **Live chat widget** — Use Crisp (crisp.chat) or Tawk.to. Free, 5-minute embed in `layout.tsx`. Do not build custom.
- [ ] **In-app feedback / rating after inspection** — "How was your inspection?" 1-5 stars + optional comment. Store in DB. PostHog survey can handle this — no custom code needed.
- [ ] **Demo mode verification** — `/demo` page exists but needs testing. Should show a completed sample inspection without requiring login.

### Auth & Security
- [ ] **2FA (Two-Factor Authentication)** — TOTP via authenticator app (Google Authenticator). Use `otpauth` library. Add `twoFactorSecret` and `twoFactorEnabled` to User schema. ~2 days.
- [ ] **Signed URLs for photo access (1hr expiry)** — Switch Vercel Blob uploads from `access: 'public'` to `access: 'private'`. Serve photos via an API proxy that generates short-lived signed URLs. Breaking change — requires updating all `<Image>` components. ~2 days.

### Payments
- [ ] **Inspection bundles (5-pack, 10-pack)** — Discounted credit bundles. "Buy 10 inspections for PKR 8,000 (save 20%)". Needs Stripe one-time payment + credit grant.
- [ ] **Receipt / invoice generation** — Auto-generate PDF receipt after payment. jsPDF is already installed.
- [ ] **Stripe subscription management portal** — `src/app/api/billing/portal/route.ts` exists. Just needs Stripe configured.

---

## 🔵 DEFER — Post-Launch (50+ customers)

### Payments
- [ ] **JazzCash integration** — Pakistan mobile wallet. Requires business registration with JazzCash merchant program + REST API integration. Complex KYC process.
- [ ] **Easypaisa integration** — Similar to JazzCash. Separate merchant onboarding.

### Notifications
- [ ] **SMS notifications** — Send SMS when inspection completes or is shared. Needs Twilio account (~$0.008/SMS in Pakistan). Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` to env.
- [ ] **WhatsApp PDF delivery** — Automatically send the inspection PDF via WhatsApp Business API after completion. Requires WhatsApp Business Account + Meta API approval.

### Advanced Auth
- [ ] **Phone OTP verification on signup** — Verify phone number during registration. Needs Twilio or local SMS provider. Deferred because Twilio costs money and email verification covers the requirement.
- [ ] **Urdu language support** — Right-to-left layout, Urdu translations for all UI strings. Significant effort, needed for mass market adoption.

### Advanced AI
- [ ] **YOLO/Roboflow detection** — Currently using Gemini direct analysis. Adding YOLO as Step 1 would improve detection speed and reduce LLM costs at scale. Add `ROBOFLOW_API_KEY` + `ROBOFLOW_MODEL_ID` to env.
- [ ] **AI accuracy tracking** — Manual review workflow where inspectors mark AI findings as correct/incorrect. Needed to calculate precision/recall. Requires new DB models and admin UI.
- [ ] **Repaint detection confidence improvement** — Current prompt-based detection is good for obvious repaints. A dedicated fine-tuned CV model would be more reliable for subtle cases.

### Data & Compliance
- [ ] **Data export endpoint** — `GET /api/user/export` returns ZIP of all user data (inspections, vehicles, photos, reports). Required for full GDPR compliance. Currently handled manually via WhatsApp request.
- [ ] **Dedicated audit log table** — Immutable DB table logging every inspection access (who, when, which inspection). PostHog covers this analytics-wise, but enterprise clients may require a tamper-proof DB record.
- [ ] **Resumable uploads (TUS protocol)** — Full chunked upload with resume-on-failure for very slow mobile connections. Current implementation has a retry button which covers 95% of cases. Full TUS is 2 days of work.

### Admin & Ops
- [ ] **Bulk admin actions** — Select multiple users, bulk gift credits / extend trial / export CSV. Currently all actions are per-user.
- [ ] **Usage analytics dashboard** — Admin view showing inspection counts over time, AI cost per inspection, revenue by plan. PostHog covers product analytics; this is an ops/finance view.

---

## 🌍 REGIONAL EXPANSION (2027)

- [ ] **Indonesia market** — Bahasa Indonesia UI, local currency (IDR), Indonesian vehicle database (Toyota Avanza, Honda Brio etc.)
- [ ] **Malaysia market** — Malay language, MYR currency, RHD vehicle specifics
- [ ] **GCC market** — Arabic UI (RTL), AED/SAR currency, GCC vehicle imports
- [ ] **Multi-tenant white-label** — Allow large fleet companies to run AutoAuditAI under their own branding

---

## ✅ Recently Completed (for reference)

- Email verification + password reset (Resend)
- Advanced AI detection: repaint, panel misalignment, rim damage, headlight fog
- Admin panel: block/unblock, view user inspections, failed inspections tab
- Delete inspections + vehicles
- Inspection type selector: B2C / B2B grouped
- Full-screen video recording with direction guidance + orientation enforcement
- Photo mode: SVG angle guides, retake UX, close-up shots
- Perceptual hash (dHash) deduplication in frame extraction
- Sharpness scoring (Laplacian variance) in frame extraction
- Photo lightbox with gallery navigation
- PostHog analytics + Sentry error monitoring
- Terms of Service + Privacy Policy pages
- Cookie consent banner
- Account deletion (GDPR-style)
- Sample report page
- Pricing updated to PKR
