# The Crucible — Phone-First Deployment Guide

This package is the updated frontend source for the Supabase project already configured during the guided setup.

## Current backend status

The following have already been applied in Supabase SQL Editor during setup:

- `001_initial_schema.sql` (original schema; it completed partially and was not rerun)
- `002_auth_trigger.sql` (signup trigger restored and verified)
- `003_security_hardening.sql` (security hardening applied and verified)
- `004_private_storage.sql` (private `attachments` bucket created and verified)

**Do not rerun migrations 001–004 against the existing project.** The SQL files are included as project records/documentation. The project already has these database changes.

## What changed in this frontend package

- Signup now sends `invite_code` in Supabase Auth user metadata. The database validates and consumes it atomically.
- Message attachments are uploaded into the signed-in member's own Storage folder.
- A message is created before attachment rows are inserted, matching the attachment RLS policy.
- Attachment records store private Storage object paths, not public URLs.
- Images and audio are displayed using temporary signed URLs.
- Upload/send errors are shown in the composer instead of silently clearing the user's draft.

## Deployment settings

Use these settings when deploying the Vite app:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20 or newer
- Environment variables:
  - `VITE_SUPABASE_URL` = your Supabase Project URL
  - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable/anon key

Never put the Supabase `service_role` key in this frontend project or in a `VITE_` variable.

## First administrator setup

1. Create a single-use invite row in Supabase SQL Editor. Example:

   ```sql
   INSERT INTO public.invite_codes (code, expires_at)
   VALUES ('CRU-FIRST-ADMIN-2026', now() + interval '7 days');
   ```

2. In the app, create your account using that invitation code.
3. Confirm your email if Supabase email confirmation is enabled.
4. In Supabase SQL Editor, promote the account by its email address:

   ```sql
   UPDATE public.profiles AS p
   SET role = 'admin'
   FROM auth.users AS u
   WHERE p.id = u.id
     AND lower(u.email) = lower('YOUR-LOGIN-EMAIL');
   ```

   Replace `YOUR-LOGIN-EMAIL` with the email used to register. Do not share your password or service-role key.
5. Sign out and sign back in so the app reloads the administrator profile.
6. Verify the Administration panel can generate a second invitation.

## Before inviting members

Test with a second email address and a fresh invitation:

- A valid invitation creates an account and consumes the code.
- Reusing that invitation fails.
- An invalid invitation fails.
- A normal member cannot see or manage invitation codes.
- Members can send messages in normal channels.
- Only admins can post in announcements or pin messages.
- Image/audio upload and playback work for signed-in members.
- Signed-out visitors cannot read channels, messages, or private files.
