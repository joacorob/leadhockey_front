# Club Admin – Technical Roadmap

This document breaks the feature down into **measurable milestones**. Check each item off as you go. All code samples are illustrative – adapt to your stack.

## 0. Context
* **Goal**: Introduce a new user role `club_admin` that is tightly bound to a single `club_id`.
  * Permissions: 
    * Access to the existing dashboard (limited surface).
    * Invite new **coach** users → invitation e-mail via **Resend**.
    * Create training **sessions** that automatically inherit the admin’s `club_id`.
  * Constraints:
    * A `club_admin` **always** has a non-null `club_id`.
    * Any resource (invite, session, etc.) created by a club_admin must embed that `club_id` (enforced at API level).

---

## 1. Database / Prisma / SQL migrations

| # | Task | Owner | Done |
|---|------|-------|------|
| 1.1 | Extend `users.role` ENUM → add `'club_admin'` |  |  |
| 1.2 | Add `club_id` FK on `users` (`NOT NULL` when `role='club_admin'`) |  |  |
| 1.3 | Add `club_id` to `sessions` table (nullable now, becomes NOT NULL in phase 2) |  |  |
| 1.4 | Create `invites` table  |
| | ```sql
| CREATE TABLE invites (
|   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
|   email TEXT NOT NULL,
|   token TEXT NOT NULL UNIQUE,
|   role TEXT NOT NULL CHECK (role='coach'),
|   club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
|   invited_by UUID REFERENCES users(id),
|   consumed_at TIMESTAMP,
|   expires_at TIMESTAMP NOT NULL
| );
| ``` |  |  |
| 1.5 | **Back-fill** existing sessions with the correct `club_id` (data migration) |  |  |
| 1.6 | Add partial index to ensure **one active invite per e-mail per club** |  |  |

Run migrations locally & in CI.

---

## 2. Backend API (NestJS / FastAPI / Express – adapt to stack)

### 2.1 Auth & RBAC
* Add `CLUB_ADMIN` constant to role enum.
* In JWT payloads include `club_id` when role = club_admin.
* Write `IsClubAdminGuard` (middleware) that also injects `req.clubId`.
* Update existing guards/policies to prevent club_admin from hitting super-admin endpoints.

### 2.2 Invitation flow
1. `POST /api/v1/invites` – Guard: `IsClubAdmin`.
   * Body: `{ email: string }`.
   * Generate secure `token`, expiry 48h.
   * Persist invite with `club_id` = admin.club_id.
   * Send email via **Resend** (`resend.emails.send({
       from: ..., to: email,
       subject: "You’ve been invited…",
       html: inviteTemplate(token) })`).
2. `GET /api/v1/invites/:token` – Validate token, return invite meta.
3. `POST /api/v1/auth/register` – Accept `{ token, name, password }`.
   * Resolve invite, create **coach** user with same `club_id`.
   * Mark invite consumed.

### 2.3 Sessions API tweaks
* On `POST /api/v1/sessions` – if user is club_admin, **override/require** `club_id = req.clubId`.
* Introduce `GET /api/v1/clubs/:id/sessions` for dashboard listing.

### 2.4 Tests
* Unit: Token generation/validation, guard logic.
* Integration: happy path & edge cases (expired / reused token).

---

## 3. Frontend (Next.js / shadcn/ui)

Milestone A – **Auth plumbing**
1. Update `lib/auth.ts`:
   * Map backend `role` → `club_admin` constant.
   * Store `club_id` in the JWT callback, e.g. `token.clubId`.
   * Expose `session.user.role`, `session.user.clubId`.
2. Add `useRole()` helper hook → `const { role } = useSession()`.

Milestone B – **Routing & Layout**
1. Create `/dashboard/club-admin` (or reuse `/dashboard` w/ role check).
2. Sidebar items: “Invite coaches”, “Sessions”.
3. Protect route with `role !== 'club_admin'` redirect.

Milestone C – **Invite UI**
1. Page `/dashboard/club-admin/invites`.
2. Form → e-mail input + submit → `POST /api/v1/invites`.
3. Table of pending invites (GET same endpoint).

Milestone D – **Session builder**
* Reuse existing Session creation UI (`/create/session`).
* Ensure `POST` payload **does not** expose club_id (server will attach).

Milestone E – **Registration**
1. New public page `/register/coach?token=…`.
2. Fetch invite meta; if valid, render password set + name.
3. Call backend `POST /auth/register`.
4. Redirect to login.

---

## 4. Email (Resend)
* Create template `coach-invite.html`.
* Variables: `CLUB_NAME`, `INVITER_NAME`, `INVITE_URL`.
* Add preview to Storybook / Playroom.

---

## 5. Observability & Security
* Log all invite events.
* Rate-limit invite creation (e.g. 10/min per club).
* Add e2e test to Cypress: club_admin → invite → signup → login.

---

## 6. Deployment Checklist
- [ ] Secrets: `RESEND_API_KEY`, `INVITE_URL_BASE` in all envs.
- [ ] Run DB migrations.
- [ ] Purge edge cache for `/dashboard` routes.
- [ ] Announce feature flag `club_admin_rollout`.

---

## 7. Timeline (🔢 = milestone number)
1. 🔢1 Database
2. 🔢2 Backend API (+tests)
3. 🔢3A-D Frontend
4. 🔢4 Emails & previews
5. 🔢3E Registration flow
6. 🔢5 Observability
7. 🔢6 Deployment

---

## 8. Nice-to-Have / Future Work
* Admin can revoke / resend invites.
* Bulk session import (CSV).
* Analytics per club (sessions count, active coaches, etc.).

---

**Happy coding 🏑**
