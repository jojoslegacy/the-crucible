-- THE CRUCIBLE: MIGRATION 004 - PRIVATE FILE STORAGE
-- The guided setup applied this migration after migration 003.

BEGIN;

INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
VALUES (
  'attachments',
  'attachments',
  false,
  20971520,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav',
    'audio/ogg', 'audio/webm', 'audio/x-m4a'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Crucible members can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Members upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Members delete their own files" ON storage.objects;

CREATE POLICY "Crucible members can view attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Members upload to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Members delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
