-- The Crucible Database Schema
-- Run this in the Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  bio text,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now()
);

-- Channels
create table public.channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  is_announcements boolean default false,
  created_at timestamptz default now()
);

-- Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references public.channels on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text,
  parent_id uuid references public.messages on delete cascade,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Attachments
create table public.attachments (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages on delete cascade,
  url text not null,
  type text not null check (type in ('image', 'audio')),
  filename text not null,
  size integer,
  created_at timestamptz default now()
);

-- Invite codes
create table public.invite_codes (
  code text primary key,
  created_by uuid references public.profiles,
  used_by uuid references public.profiles,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Channel read tracking for unread indicators
create table public.channel_reads (
  user_id uuid references public.profiles on delete cascade,
  channel_id uuid references public.channels on delete cascade,
  last_read_at timestamptz default now(),
  primary key (user_id, channel_id)
);

-- Indexes for performance
create index messages_channel_id_idx on public.messages (channel_id, created_at desc);
create index messages_parent_id_idx on public.messages (parent_id);
create index attachments_message_id_idx on public.attachments (message_id);

-- Insert default channels
insert into public.channels (name, slug, description, is_announcements) values
  ('welcome', 'welcome', 'Introduction to The Crucible and how to participate.', false),
  ('announcements', 'announcements', 'Important updates from administrators.', true),
  ('the-gathering', 'the-gathering', 'The primary conversation space.', false),
  ('the-forge', 'the-forge', 'Writing, poetry, and creative development.', false),
  ('the-soundboard', 'the-soundboard', 'Music collaboration, lyrics, and audio sharing.', false),
  ('the-embers', 'the-embers', 'Encouragement, reflections, and spiritual growth.', false);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;
alter table public.invite_codes enable row level security;
alter table public.channel_reads enable row level security;

-- Profiles policies
create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Channels: everyone can read
create policy "Anyone can view channels" on public.channels
  for select using (true);

-- Messages: authenticated users can read
create policy "Authenticated users can view messages" on public.messages
  for select using (auth.role() = 'authenticated');

-- Messages: authenticated users can insert (except announcements for non-admins)
create policy "Users can insert messages" on public.messages
  for insert with check (
    auth.uid() = user_id
    and (
      not exists (
        select 1 from public.channels c 
        where c.id = channel_id and c.is_announcements = true
      )
      or exists (
        select 1 from public.profiles p 
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- Messages: users can update/delete own
create policy "Users can update own messages" on public.messages
  for update using (auth.uid() = user_id);

create policy "Users can delete own messages" on public.messages
  for delete using (auth.uid() = user_id);

-- Admins can pin messages
create policy "Admins can pin messages" on public.messages
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Attachments
create policy "Authenticated users can view attachments" on public.attachments
  for select using (auth.role() = 'authenticated');

create policy "Users can insert attachments" on public.attachments
  for insert with check (auth.role() = 'authenticated');

-- Invite codes: only admins can manage
create policy "Admins can manage invite codes" on public.invite_codes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can view unused invite codes for validation" on public.invite_codes
  for select using (used_by is null);

-- Channel reads
create policy "Users can manage own read status" on public.channel_reads
  for all using (auth.uid() = user_id);

-- Storage bucket policies (run after creating bucket 'attachments' in dashboard)
-- These are documented in the setup guide

-- Function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.handle_updated_at();

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;
