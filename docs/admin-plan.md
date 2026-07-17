# J&K Daycare — Admin & Parent Portal · Plan & Spec

A build blueprint for a **custom, bilingual (EN/ES) internal admin + parent-facing portal**, on the
existing **Astro + Cloudflare Workers + D1** stack. Grounded in research of the leading childcare
platforms (Brightwheel, Lillio/HiMama, Procare, Playground, Kangarootime, Famly, Storypark).

> Status: planning. Nothing here is built yet. This is the reference we recreate from.

---

## 1. Goal

One seamless bilingual property on `jkdaycare.com` that lets Magaly (owner) and occasional staff
**manage children, attendance, daily notes/reports, messaging, billing (incl. the NEFWC voucher /
parent co-pay split), and documents** — and gives **parents a portal** for their child's updates,
messages, forms, and payments.

## 2. Guardrails (decided up front)

- **Payments → Stripe-hosted only** (Checkout / Payment Links / hosted Invoicing). Card & bank data
  **never touch our Workers or D1**; we store only Stripe tokens/amounts/status. This keeps us at the
  lowest PCI tier (**SAQ A**). We do **not** build card handling — that's a legal/PCI landmine.
- **App shell → installable PWA**, not native iOS/Android apps (avoids app-store overhead; still gives
  app-like home-screen + web push).
- **Privacy/security** → per-child media privacy enforced **server-side**; photos/videos in a **private
  R2 bucket** served via short-lived signed URLs (never public); **audit log** on sensitive actions;
  least-privilege roles; regular **D1 backups** (these records are licensing-critical).
- **Bilingual** → every parent-facing string in EN/ES; **per-user language** preference; optional
  auto-translation of outbound broadcasts via the existing **Workers AI** binding.

## 3. What the platforms do today (research summary)

All eight converge on the **same ~15 modules**; they differ in depth, not breadth. Brightwheel &
Playground are the modern mobile-first all-in-ones; **Procare** is deepest on **billing/subsidy**;
**Lillio & Storypark** on **learning documentation**; **Famly** on attendance-based invoicing. For a
**6-child home program**, the genuinely high-value core is: **daily reports (photos + meals/naps/
diapers/mood), parent messaging, digital check-in/out, and getting paid (private-pay + voucher split).**
Everything else is nice-to-have.

**Build-vs-buy reality:** Brightwheel's **free tier** already covers messaging + daily reports + photos
at $0 for in-home programs under 6 kids. A full custom clone is a multi-month, $40k–$250k-class effort
in the market. We build custom only for what's uniquely ours and low-risk (**bilingual done right, the
NEFWC/CCFA voucher+co-pay split, brand ownership**) and lean on Stripe for payments.

## 4. Feature modules (prioritized for J&K)

**P1 — core (highest value, no payment/PCI risk):**
- Daily reports / activity feed — meals, naps, diapers, mood, activities, milestones, notes, **photos**
- Parent messaging + announcements (language-aware)
- Digital check-in/out + attendance (timestamp + PIN/signature) — **licensing & subsidy require this**
- Children roster + child profiles (contacts, authorized pickups, **allergies/health**)
- Photo/video sharing with **per-child privacy**

**P2 — money & compliance:**
- Billing/invoices + **Stripe** payments & autopay (card + ACH)
- **Subsidy/voucher split** tracker (NEFWC/CCFA agency portion vs. family co-pay)
- Incident/injury reports (with parent e-acknowledgment)
- Medication authorizations + administration log; allergy flags at mealtime
- Document/compliance vault with **expiry reminders** (immunizations, CPR, license)
- Calendar / closures (parent-visible)

**P3 — later:**
- Enrollment/intake + e-signatures + waitlist (wire to existing public-site `signups`)
- Staff (light): profiles + credential expiry + occasional-staff hours
- Reports/exports (attendance, revenue, subsidy reconciliation, immunization status)
- Lesson/theme planner (optionally auto-fill daily reports)
- SMS urgent alerts

## 5. Roles & permissions

| Role | Sees | Can do |
|---|---|---|
| **Owner/Admin (Magaly)** | Everything | Full CRUD; billing/settings; manage staff & parents; exports; audit log |
| **Staff (occasional)** | Room-scoped: children present, own hours | Log reports/attendance/incidents/meds; message families; post photos. **No financials.** |
| **Parent/Guardian** | Only their own child(ren) | Read reports/photos; message; pay invoices/autopay; sign forms; update contacts & pickups; set EN/ES |
| **Agency (NEFWC/CCFA)** | — (data, not a login) | Modeled as a **payer** on a child's billing so tuition can split agency vs. family |

Cross-cutting: per-area **view vs. edit**, **child/room scoping** for staff, **child-level media
privacy**, and an **audit trail** — designed in from day one (cheap up front, expensive to retrofit).

## 6. Information architecture

### 6.1 Admin (internal)
- **Dashboard** — who's here now · ratio/age check (≤6, ≤3 under 2) · today's activity feed · alerts
  (overdue invoices, unsigned forms, **expiring documents**) · birthdays · quick actions
- **Children (roster)** — cards/table w/ status, allergy & balance flags; add/edit; light waitlist
- **Child profile** (tabbed) — Overview · Family & authorized pickups · Health (allergies, meds,
  immunizations) · Daily reports · Attendance · Billing (+ **subsidy split**) · Documents · Notes
- **Attendance** — live check-in/out board · kiosk mode (PIN/QR + signature) · logs & export
- **Daily Reports** — compose activity (one child or whole group) · program feed · photo upload w/ tagging
- **Messages** — inbox per family · broadcast/announcements · templates (language-aware)
- **Billing** — invoices · autopay · **subsidy split (NEFWC vs co-pay)** · statements · discounts
- **Calendar** — closures/holidays/events (parent-visible)
- **Enrollment** — intake forms + e-sign + document requests + waitlist pipeline
- **Staff** — profiles · credential expiry · light scheduling · time logging
- **Documents** — program/child/staff vault · **expiration dashboard**
- **Reports** — attendance, revenue/aging, subsidy reconciliation, immunization status, incidents
- **Settings** — program profile · rooms/ratios · billing/Stripe · users & roles · notifications · language

### 6.2 Parent portal (PWA)
Home/feed · My child's daily report · Photos · Messages · **Invoices & Pay / Autopay** · Calendar ·
Forms to sign · My contacts & authorized pickups · Language preference. Strictly scoped to their own
child; child-level media privacy.

## 7. Data model (D1 sketch — first pass)

Core tables (SQLite/D1):
- `users` (id, email, role, language, password/otp, created) · `sessions`
- `children` (id, first/last, dob, status, primary_language, allergies, notes)
- `guardians` · `child_guardians` (join, relationship, is_authorized_pickup, is_billing)
- `staff` (profile, credentials + expiry)
- `attendance` (child_id, in_ts, out_ts, signed_by, method)
- `activities` (child_id or group, type: meal|nap|diaper|mood|activity|milestone|note, payload, staff_id, ts)
- `media` (r2_key, child tags, uploaded_by, ts) · `media_access` (per-child privacy)
- `threads` · `messages` · `announcements`
- `invoices` · `invoice_lines` · `payments` (Stripe refs only) · `subsidy_payers` · `child_billing` (split config)
- `documents` (owner_type: program|child|staff, r2_key, expires_on)
- `incidents` · `medications` · `med_logs`
- `audit_log` (actor, action, entity, ts)

## 8. Tech stack

- **Runtime:** Astro (SSR) on **Cloudflare Workers** (already deployed this way)
- **DB:** **D1** (`jkdaycare-d1`, binding `DB`) — already provisioned; add migrations
- **Media:** **R2** (private) + optional Cloudflare Images for resizing; signed URLs
- **Sessions/cache:** **KV** (or D1)
- **Auth:** email + magic-link/OTP; role-based; consider **Cloudflare Access** for the admin-only side
- **Payments:** **Stripe** hosted (Checkout/Invoicing) + webhook route on a Worker
- **Notifications:** email (Resend/Postmark/SES) primary; **Web Push** (PWA); SMS (Twilio) only for urgent/opt-in; **Queues** for fan-out
- **i18n:** EN/ES resource files + per-user language; **Workers AI** (`AI`) for optional translation
- **PWA:** manifest + service worker (installable, web push)

## 9. Phased roadmap

**Phase 1 — the parent-love loop (no money, no PCI):**
auth + roles → children roster & profiles → **daily reports + photos (R2)** → **bilingual parent portal
(PWA, read)** → messaging + announcements → digital check-in/out + attendance → settings basics + audit log.
_First concrete slice:_ an authenticated `/admin` area + D1 migration for `users`/`children`/`guardians`,
a children roster, a child profile, and daily-activity logging — then the parent read view.

**Phase 2 — money & compliance:** Stripe billing + autopay → **voucher/co-pay split tracker** →
incidents → meds/allergy log → document vault w/ expiry → calendar.

**Phase 3 — polish:** enrollment/e-sign + waitlist → staff (light) → reports/exports → lesson planner → SMS.

## 10. Massachusetts compliance anchors

Licensing under **606 CMR 7.00** (EEC); FCC ratio (one educator ≤6 children, ≤3 under 2, incl. a walking
toddler); **verifiable date-stamped attendance** (also required for subsidy); **BRC/CORI** for provider +
household members 15+. Subsidy runs through EEC's **CCFA** system (weekly attendance, monthly billing,
enrollment-based reimbursement + income-based **parent co-pay**); Springfield vouchers administered via
**Partners for Community / NEFWC**.

## 11. Explicitly out of scope

Building card/bank handling (use Stripe) · native mobile apps (use PWA) · multi-site/Stripe Connect ·
payroll · deep curriculum/assessment tooling.
