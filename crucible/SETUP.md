# The Crucible — Setup

## Existing Supabase project

The guided setup has already applied migrations 001–004 to the current Supabase project. Do not rerun them against that project. See `PHONE_DEPLOYMENT_GUIDE.md` for the current state and next steps.

## Deploy the frontend

This is a React + TypeScript + Vite application.

- Build command: `npm run build`
- Output directory: `dist`
- Node: 20+
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

Never expose the Supabase service-role key in the browser.

For first-admin setup and mobile-friendly deployment instructions, see `PHONE_DEPLOYMENT_GUIDE.md`.
