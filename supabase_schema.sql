create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- raw transcripts and user metadata
create table if not exists public.transcriptions (
  id          uuid primary key default uuid_generate_v4(),
  created_by  uuid references auth.users(id) default auth.uid(),
  source      text not null check (source in ('youtube','doc','tweet')),
  raw_url     text,
  transcript  text,
  summary     text,
  status      text not null default 'complete' check (status in ('pending','complete','error')),
  created_at  timestamptz default now()
);
alter table public.transcriptions
  add column if not exists created_by uuid references auth.users(id) default auth.uid();
create index if not exists transcriptions_created_at_idx on public.transcriptions (created_at);
create index if not exists transcriptions_source_idx on public.transcriptions (source);

alter table public.transcriptions enable row level security;
drop policy if exists "owner-access" on public.transcriptions;
create policy "owner-access" on public.transcriptions
  for all
    using (auth.role() = 'service_role' or created_by = auth.uid())
    with check (auth.role() = 'service_role' or created_by = auth.uid());

-- per-transcript analysis results
create table if not exists public.analysis_details (
  id              uuid primary key default uuid_generate_v4(),
  transcription_id uuid references public.transcriptions(id) on delete cascade,
  created_by      uuid references auth.users(id) default auth.uid(),
  sentiment       numeric,
  tokens          integer,
  entities        jsonb,
  embedding       vector(1536),
  created_at      timestamptz default now()
);
alter table public.analysis_details
  add column if not exists created_by uuid references auth.users(id) default auth.uid();
create index if not exists analysis_details_transcription_idx on public.analysis_details (transcription_id);

alter table public.analysis_details enable row level security;
drop policy if exists "owner-access" on public.analysis_details;
create policy "owner-access" on public.analysis_details
  for all
    using (auth.role() = 'service_role' or created_by = auth.uid())
    with check (auth.role() = 'service_role' or created_by = auth.uid());

-- aggregated summaries
create table if not exists public.summary_clusters (
  id          uuid primary key default uuid_generate_v4(),
  created_by  uuid references auth.users(id) default auth.uid(),
  summary     text,
  created_at  timestamptz default now()
);
alter table public.summary_clusters
  add column if not exists created_by uuid references auth.users(id) default auth.uid();
create index if not exists summary_clusters_created_at_idx on public.summary_clusters (created_at);

alter table public.summary_clusters enable row level security;
drop policy if exists "owner-access" on public.summary_clusters;
create policy "owner-access" on public.summary_clusters
  for all
    using (auth.role() = 'service_role' or created_by = auth.uid())
    with check (auth.role() = 'service_role' or created_by = auth.uid());

-- daily analytics snapshot
create table if not exists public.daily_snapshot (
  id               uuid primary key default uuid_generate_v4(),
  snapshot_date    date not null default current_date,
  transcripts_cnt  integer,
  avg_sentiment    numeric,
  top_entities     jsonb,
  created_at       timestamptz default now()
);
create index if not exists daily_snapshot_date_idx on public.daily_snapshot (snapshot_date);

alter table public.daily_snapshot enable row level security;
drop policy if exists "admin-only" on public.daily_snapshot;
create policy "admin-only" on public.daily_snapshot
  for all using (auth.role() = 'service_role');

-- chat subsystem
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  created_by  uuid references auth.users(id) default auth.uid(),
  created_at  timestamptz default now()
);
alter table public.conversations
  add column if not exists created_by uuid references auth.users(id) default auth.uid();
create index if not exists conversations_created_at_idx on public.conversations (created_at);

alter table public.conversations enable row level security;
drop policy if exists "owner-access" on public.conversations;
create policy "owner-access" on public.conversations
  for all
    using (auth.role() = 'service_role' or created_by = auth.uid())
    with check (auth.role() = 'service_role' or created_by = auth.uid());

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  created_by      uuid references auth.users(id) default auth.uid(),
  role            text not null check (role in ('user','assistant')),
  content         text,
  token_count     integer,
  embedding       vector(1536),
  created_at      timestamptz default now()
);
alter table public.messages
  add column if not exists created_by uuid references auth.users(id) default auth.uid();
create index if not exists messages_conversation_idx on public.messages (conversation_id);

alter table public.messages enable row level security;
drop policy if exists "owner-access" on public.messages;
create policy "owner-access" on public.messages
  for all
    using (auth.role() = 'service_role' or created_by = auth.uid())
    with check (auth.role() = 'service_role' or created_by = auth.uid());

-- secure secret storage
create table if not exists public.secrets (
  key        text primary key,
  value      text not null,
  created_at timestamptz default now()
);

alter table public.secrets enable row level security;
drop policy if exists "service-select" on public.secrets;
create policy "service-select" on public.secrets
  for select using (auth.role() = 'service_role');
drop policy if exists "service-insert" on public.secrets;
create policy "service-insert" on public.secrets
  for insert with check (auth.role() = 'service_role');
