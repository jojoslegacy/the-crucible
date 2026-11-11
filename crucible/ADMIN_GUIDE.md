# Administrator Guide — The Crucible

## Inviting Members
1. Open the app and click your name → Admin
2. Go to Invites tab
3. Generate a code
4. Share the code with the person (email, text, in person)
5. They go to the app URL, choose "Join with invite code", and create their account

## Announcements
Only administrators can post in #announcements. Use it for gathering dates, important updates, and community news.

## Pinning Messages
Admins can pin important messages (feature can be extended in the UI as needed).

## Managing Members
- View members in the Admin panel
- To fully revoke access: In Supabase Dashboard → Authentication → Users → ban or delete the user
- Their messages remain but they can no longer log in

## Multiple Administrators
Change any member's `role` to `admin` in the Supabase Table Editor (profiles table). There is no limit.

## Backups
- Database: Supabase Dashboard → Database → Backups
- Or run SQL exports periodically
- Storage: Download important audio/images from the Storage bucket as needed

## Troubleshooting
- Messages not appearing in real time: Check that Realtime is enabled on the messages table
- Upload failures: Verify Storage bucket policies allow authenticated uploads
- Cannot sign up: Confirm invite code is unused and not expired

The application is designed to require minimal ongoing maintenance.
