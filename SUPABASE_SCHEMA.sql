-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (auto-created via trigger)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Documents table
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  file_type text not null check (file_type in ('pdf', 'markdown', 'txt')),
  file_path text not null,
  page_count int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Readings table (tracks progress)
create table readings (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  current_slide int not null default 0,
  total_slides int not null,
  percentage_read int not null default 0,
  last_read_at timestamp with time zone default now()
);

-- Bookmarks table
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  slide_index int not null,
  created_at timestamp with time zone default now(),
  unique(document_id, user_id, slide_index)
);

-- User settings table
create table user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users on delete cascade,
  font_size int not null default 18,
  font_family text not null default 'system',
  line_height numeric not null default 1.5,
  reading_width text not null default 'normal',
  theme text not null default 'dark',
  bg_color text default '#0E0E10',
  text_color text default '#F2F2F0',
  words_per_slide int not null default 100,
  markdown_split_level int not null default 1,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table readings enable row level security;
alter table bookmarks enable row level security;
alter table user_settings enable row level security;

-- RLS policies for profiles
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- RLS policies for documents
create policy "Users can view their own documents" on documents
  for select using (auth.uid() = user_id);
create policy "Users can insert their own documents" on documents
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents" on documents
  for update using (auth.uid() = user_id);
create policy "Users can delete their own documents" on documents
  for delete using (auth.uid() = user_id);

-- RLS policies for readings
create policy "Users can view their own readings" on readings
  for select using (auth.uid() = user_id);
create policy "Users can insert their own readings" on readings
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own readings" on readings
  for update using (auth.uid() = user_id);

-- RLS policies for bookmarks
create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);
create policy "Users can insert their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);

-- RLS policies for user_settings
create policy "Users can view their own settings" on user_settings
  for select using (auth.uid() = user_id);
create policy "Users can insert their own settings" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own settings" on user_settings
  for update using (auth.uid() = user_id);

-- Trigger to create profile on auth signup
create function handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_auth_user_created();

-- Create storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

-- RLS policy for storage
create policy "Users can upload their own documents" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can download their own documents" on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own documents" on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
