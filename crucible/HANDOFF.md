# The Crucible — Project Handoff

**Private Christian creative community web app (10–50 members).**

## Tech stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase PostgreSQL, Auth, Storage, Realtime
- Hosting: Cloudflare Pages or Vercel
- Authentication: email/password with invitation-only signup

## Current backend setup status

The existing Supabase project was configured during the guided setup. The following SQL work has been completed and verified:

1. Initial schema: all six core tables exist and RLS is enabled.
2. Signup trigger: `on_auth_user_created` on `auth.users` was installed and verified.
3. Security hardening: migration 003 applied; invitation redemption is enforced by the signup trigger; profile role changes are restricted; message pinning is guarded.
4. Private storage: `attachments` bucket exists with `public = false`, 20 MB limit, and authenticated storage policies.

**Do not rerun migrations 001–004 on the already-configured Supabase project.** The migration files are retained in this archive as project records.

## Frontend fixes in this package

- Signup sends the invitation code in Supabase Auth metadata for server-side validation.
- Message attachments are uploaded to the signed-in user's own Storage folder.
- Message rows are created before attachment metadata, as required by the RLS policy.
- Attachment rows store Storage object paths, not public URLs.
- Private media is rendered through temporary signed URLs.
- Upload and message errors are surfaced to the user.

## Deployment

- Build: `npm run build`
- Output: `dist`
- Node: 20+
- Required public frontend variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Never include the Supabase service-role key in frontend code or `VITE_` variables.

See `PHONE_DEPLOYMENT_GUIDE.md` for the first administrator procedure and launch checklist.
