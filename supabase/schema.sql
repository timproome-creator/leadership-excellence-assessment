-- ============================================================
-- Warehouse Leadership Excellence Assessment (WLEA) — Supabase Schema
-- Run in the Supabase SQL Editor on the shared project.
-- The profiles table and auth trigger already exist — do not re-run them.
--
-- Two-tree model (see Competency Assessment/ASSESSMENT_ENGINE_ARCHITECTURE.md):
--   • Framework definition (clusters/competencies/anchors/scale) is CODE-SEEDED
--     for v1 — it lives in lib/framework/*. DB-backed framework tables are a
--     Phase-3 step and do not block the pilot.
--   • The instance tree (an assessment + its ratings) is persisted below.
-- ============================================================

-- ── Layer 1: user-owned assessment instances ─────────────────────
-- Anonymous runs allowed (user_id = null). Rater is first-class: self and
-- line-manager ratings are held independently so the reveal/gap analysis and
-- future multi-rater (assessor / peer / 360) modes work without schema change.
create table public.wlea_assessments (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade,
  schema_version      integer default 1,
  module_key          text not null default 'wlea',
  module_version      text not null default '1.0.0',

  -- Metadata block
  subject_name        text,
  subject_email       text,        -- employee: where the self-invite is sent
  creator_email       text,        -- manager: where the console link is sent (recovery)
  role_level          text not null,        -- 'jpm' | 'pm' | 'dcm' | 'exec'
  assessment_mode     text not null default 'two_way',  -- 'two_way' | '360'
  industry            text,
  warehouse_type      text,
  business_unit       text,
  site                text,
  country             text,

  -- Flow state
  status              text not null default 'open',
                      -- open | complete | revealed

  -- Tier-1 async workflow (manager-led). Two unguessable bearer tokens per
  -- assessment: the manager token drives the owner console + reveal, the self
  -- token lets the employee rate only. All access is mediated server-side by
  -- the service role (app/actions.ts) and gated on these tokens — the browser
  -- never queries this table directly.
  manager_token        uuid not null default gen_random_uuid() unique,
  self_token           uuid not null default gen_random_uuid() unique,
  manager_submitted_at timestamptz,
  self_submitted_at    timestamptz,

  -- Consent: recorded the first time each rater acknowledges the consent
  -- screen, before they can enter any ratings. Required because this table
  -- holds a named person's identifiable judgement about another named person.
  self_consented_at    timestamptz,
  manager_consented_at timestamptz,

  -- Independent rater inputs (keyed by competency.key → { score, confidence, comment })
  self_ratings        jsonb not null default '{}',
  manager_ratings     jsonb not null default '{}',

  -- Denormalised headline outputs (computed once both raters have submitted)
  overall_self        numeric,
  overall_manager     numeric,
  maturity_label      text,
  result_summary      jsonb not null default '{}',

  created_at          timestamptz default now(),
  completed_at        timestamptz
);

alter table public.wlea_assessments enable row level security;

create policy "Users can view own WLEA assessments"
  on public.wlea_assessments for select
  using (auth.uid() = user_id);

-- Inserts now go exclusively through the server-side service role (which
-- bypasses RLS), so no anon/authenticated insert policy is needed. Removing
-- the previous "or user_id is null" check closes anon writes to this table.
-- (no insert policy)

create policy "Users can update own WLEA assessments"
  on public.wlea_assessments for update
  using (auth.uid() = user_id);

create policy "Users can delete own WLEA assessments"
  on public.wlea_assessments for delete
  using (auth.uid() = user_id);


-- ── Layer 2: anonymised benchmark seed ───────────────────────────
-- Service role only. Feeds future leadership benchmarking by role level +
-- segment. Never returned directly to clients.
--
-- SECURITY: RLS is ENABLED with NO policies. In Supabase, leaving RLS
-- disabled does NOT lock a table down — the anon/authenticated roles keep
-- their default grants and PostgREST would expose it for read AND write to
-- anyone holding the (browser-shipped) anon key. Enabling RLS with zero
-- policies denies anon/authenticated entirely; the service role bypasses RLS,
-- so only server-side service-role writes (app/actions.ts) can reach it.
create table public.wlea_benchmark_data (
  id                  uuid default gen_random_uuid() primary key,
  schema_version      integer default 1,
  module_version      text not null default '1.0.0',

  -- Segmentation
  role_level          text not null,
  industry            text,
  warehouse_type      text,
  country             text,

  -- Per-competency manager scores (keyed by competency.key → number)
  competency_scores   jsonb not null default '{}',

  -- Aggregate
  overall_manager     numeric,
  maturity_label      text,

  created_at          timestamptz default now()
);

-- Lock the table: RLS on, no policies → only the service role can read/write it.
alter table public.wlea_benchmark_data enable row level security;


-- ── Layer 3: 360-mode raters (peer / direct_report) ──────────────
-- Additive: the two-way self/manager flow above is untouched. A 360
-- assessment has a variable number of peers and direct reports, which
-- the hardcoded self_ratings/manager_ratings columns cannot hold, so
-- this is a genuine one-row-per-rater child table (the part of the
-- original "rater is first-class" design Tier 1 didn't need yet).
-- Same bearer-token pattern as wlea_assessments: unguessable token,
-- service-role-mediated, browser never queries this table directly.
create table public.wlea_raters (
  id                uuid default gen_random_uuid() primary key,
  assessment_id     uuid not null references public.wlea_assessments(id) on delete cascade,
  rater_type        text not null,        -- 'peer' | 'direct_report'
  rater_name        text,
  rater_email       text not null,
  token             uuid not null default gen_random_uuid() unique,
  ratings           jsonb not null default '{}',
  submitted_at      timestamptz,
  consented_at      timestamptz,
  created_at        timestamptz default now()
);

-- RLS on, no policies → service-role only, same lockdown pattern as above.
alter table public.wlea_raters enable row level security;


-- ============================================================
-- MIGRATION — idempotent. Run this block on any deployment that already
-- created wlea_assessments from an earlier version of this file. Safe to
-- re-run; a fresh `create table` above already includes these.
-- ============================================================
alter table public.wlea_assessments
  add column if not exists manager_token        uuid not null default gen_random_uuid(),
  add column if not exists self_token           uuid not null default gen_random_uuid(),
  add column if not exists manager_submitted_at timestamptz,
  add column if not exists self_submitted_at    timestamptz,
  add column if not exists subject_email        text,
  add column if not exists creator_email        text,
  add column if not exists self_consented_at    timestamptz,
  add column if not exists manager_consented_at timestamptz,
  add column if not exists assessment_mode      text not null default 'two_way';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wlea_assessments_manager_token_key'
  ) then
    alter table public.wlea_assessments add constraint wlea_assessments_manager_token_key unique (manager_token);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'wlea_assessments_self_token_key'
  ) then
    alter table public.wlea_assessments add constraint wlea_assessments_self_token_key unique (self_token);
  end if;
end $$;

-- Close anon writes left open by the earlier insert policy.
drop policy if exists "Users can insert own WLEA assessments" on public.wlea_assessments;
