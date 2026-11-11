# The Crucible

A private collaborative community web application for writing, music, discussion, encouragement, and fellowship.

**Tagline:** Truth Before Talent.

## Technology Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Hosting:** Cloudflare Pages or Vercel (frontend) + Supabase (backend)
- **PWA:** Vite PWA Plugin

## Free Tier Considerations

### Supabase Free Tier (as of 2026)
- **Database:** 500 MB
- **File Storage:** 1 GB
- **Bandwidth:** 5 GB / month
- **Auth:** Unlimited (with rate limits)
- **Realtime:** 200 concurrent connections, 2 million messages/month
- **Projects pause** after 1 week of inactivity (free tier)

For a community of 50 members with moderate activity (text + occasional audio/images), free tier is realistic for months. Audio uploads are the primary storage risk.

### Potential Costs
- Supabase Pro ($25/mo) if storage exceeds 1 GB or you need no pausing.
- Cloudflare Pages: Free tier is generous (unlimited sites, 500 builds/month).
- No advertising, no paid APIs required.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your Project URL and `anon` public key.

### 2. Existing Supabase Project

The current guided deployment has already applied and verified migrations 001–004. **Do not rerun them against that existing project.** The migration files are included in this archive as project records. See `PHONE_DEPLOYMENT_GUIDE.md` for the current state and first-admin steps.

For a brand-new Supabase project only, use the migrations in order after reviewing the current SQL and storage policies.

### 3. Private Storage

The current project has a private `attachments` bucket, a 20 MB object limit, and authenticated-member storage policies. The frontend stores object paths and generates temporary signed URLs for display.

### 4. Authentication

Signup is invitation-only. The frontend passes the invitation code as Supabase Auth user metadata; the database trigger validates and consumes it in the same signup transaction. Do not reintroduce client-side reads of `invite_codes`.

### 5. Environment Variables
Copy `.env.example` to `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 6. Install and Run Locally
```bash
npm install
npm run dev
```

### 7. Create First Administrator
1. Generate an invite code manually in the `invite_codes` table, or temporarily allow signup.
2. Sign up with the invite.
3. In Supabase Table Editor, update your profile `role` to `'admin'`.
4. Now you can generate invites from the Admin panel.

### 8. Deploy Frontend
**Cloudflare Pages:**
1. Push code to GitHub.
2. Connect repo in Cloudflare Pages.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables.

**Vercel:** Similar process.

## Features Implemented

- Invitation-only membership via codes
- Six channels with appropriate permissions
- Real-time messaging
- Threaded replies
- Image and audio attachments with playback
- Profile management
- Admin panel for invites and member overview
- PWA support (add to home screen)
- Mobile-first responsive design
- Row Level Security on all tables
- Unread tracking foundation

## Administrator Guide

- **Invite members:** Admin panel → Invites → Generate code → Share the code
- **Post announcements:** Only admins can post in #announcements
- **Moderate:** Admins can pin messages (extend as needed)
- **Remove members:** Use Supabase Auth dashboard to ban/delete user; RLS will block access

## Backup and Recovery

- Supabase Dashboard → Database → Backups (free tier has daily backups on Pro; free has limited)
- Export via SQL: `pg_dump` or Supabase export tools
- Storage: Download bucket contents as needed

## Future Expansion

The schema supports:
- Additional channels
- Calendar / RSVP tables
- Shared documents
- More granular permissions

No rebuild required for moderate growth.

## Design Notes

Warm, understated palette:
- Charcoal backgrounds
- Bronze accents
- Parchment text
- Ember highlights

Typography: Inter (UI) + Georgia (headings)

## Security

- All access controlled by RLS
- No service role keys in frontend
- Private storage bucket
- Invite-only registration
- No public indexing

---

Built for a private Christian creative community. The conversation continues between gatherings.
