-- THE CRUCIBLE: MIGRATION 003 - SECURITY HARDENING
-- This is the version applied during the guided Supabase setup.
-- Do not rerun against an already-migrated production database unless
-- intentionally reapplying the idempotent policy/function changes.

BEGIN;

-- 1. PROTECT PROFILES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name, bio, avatar_url) ON TABLE public.profiles TO authenticated;
REVOKE INSERT ON TABLE public.profiles FROM anon, authenticated;

-- 2. CHANNEL ACCESS
DROP POLICY IF EXISTS "Anyone can view channels" ON public.channels;
CREATE POLICY "Authenticated members can view channels"
ON public.channels FOR SELECT TO authenticated USING (true);

-- 3. MESSAGE ACCESS AND PERMISSIONS
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can pin messages" ON public.messages;

CREATE POLICY "Authenticated members can view messages"
ON public.messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND COALESCE(is_pinned, false) = false
  AND EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id = channel_id
      AND (
        c.is_announcements = false
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      )
  )
);

CREATE POLICY "Members can update own messages"
ON public.messages FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update messages"
ON public.messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "Members can delete own messages"
ON public.messages FOR DELETE TO authenticated
USING (auth.uid() = user_id);

REVOKE UPDATE ON TABLE public.messages FROM anon, authenticated;
GRANT UPDATE (content, is_pinned) ON TABLE public.messages TO authenticated;

-- 4. PREVENT UNAUTHORIZED PINNING OR EDITING OF OTHER MEMBERS' MESSAGES
CREATE OR REPLACE FUNCTION public.guard_message_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor uuid;
  v_is_admin boolean;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_actor AND role = 'admin'
  ) INTO v_is_admin;

  IF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can pin messages';
  END IF;

  IF v_actor <> OLD.user_id THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'You cannot modify another member''s message';
    END IF;
    IF NEW.content IS DISTINCT FROM OLD.content THEN
      RAISE EXCEPTION 'Administrators cannot edit another member''s message content';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_update_security ON public.messages;
CREATE TRIGGER messages_update_security
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.guard_message_updates();

-- 5. ATTACHMENTS MUST BELONG TO A MESSAGE OWNED BY THE UPLOADER
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON public.attachments;

CREATE POLICY "Authenticated members can view attachments"
ON public.attachments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can attach files to own messages"
ON public.attachments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id AND m.user_id = auth.uid()
  )
);

-- 6. INVITATION CODES: ADMIN-ONLY CLIENT ACCESS
DROP POLICY IF EXISTS "Admins can manage invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Anyone can view unused invite codes for validation" ON public.invite_codes;

CREATE POLICY "Administrators manage invitations"
ON public.invite_codes FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

REVOKE ALL ON TABLE public.invite_codes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invite_codes TO authenticated;

-- 7. ATOMIC INVITATION VALIDATION AND REDEMPTION DURING AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invite_code text;
  v_display_name text;
BEGIN
  v_invite_code := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'invite_code', '')));
  v_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'New Member'
  );

  IF v_invite_code = '' THEN
    RAISE EXCEPTION 'A valid invitation code is required';
  END IF;

  INSERT INTO public.profiles (id, display_name, role)
  VALUES (NEW.id, v_display_name, 'member');

  UPDATE public.invite_codes
  SET used_by = NEW.id
  WHERE code = v_invite_code
    AND used_by IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already used invitation code';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. CHANNEL READ TRACKING
DROP POLICY IF EXISTS "Users can manage own read status" ON public.channel_reads;
CREATE POLICY "Members manage their own read status"
ON public.channel_reads FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. FUNCTION EXECUTION PERMISSIONS
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_message_updates() FROM PUBLIC, anon, authenticated;

COMMIT;
