-- learning_events table — append-only event log for the SparkCode MVP
-- so we can derive the round-1 clear report and surface UX bottlenecks.
--
-- session_id: anonymous identifier minted client-side (UUIDv4 in
--             localStorage). Not tied to any user account at MVP.
-- event_type: closed enum (check constraint) so a typo doesn't silently
--             create a parallel event stream.
-- metadata:   per-event-type free-form JSON. e.g. judge_executed stores
--             {correct: bool, try_count: int}, question_asked stores
--             {question: text}, code_changed stores {chars: int}.

create table public.learning_events (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null,
  lesson_id   text        not null,
  step_id     text,
  event_type  text        not null check (event_type in (
    'lesson_started',
    'step_started',
    'step_completed',
    'judge_executed',
    'hint_requested',
    'question_asked',
    'code_changed',
    'lesson_completed'
  )),
  metadata    jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index learning_events_session_id_idx on public.learning_events (session_id);
create index learning_events_lesson_id_idx  on public.learning_events (lesson_id);
create index learning_events_event_type_idx on public.learning_events (event_type);
create index learning_events_created_at_idx on public.learning_events (created_at desc);

-- Row Level Security
-- - Anonymous + authenticated users may INSERT (write-only firehose).
-- - SELECT / UPDATE / DELETE have no policy → only service_role
--   bypasses RLS, which is what the report aggregator uses.
alter table public.learning_events enable row level security;

create policy "anyone can insert learning events"
  on public.learning_events
  for insert
  to anon, authenticated
  with check (true);
