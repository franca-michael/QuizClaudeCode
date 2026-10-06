create type difficulty as enum ('business', 'intermediate', 'advanced');

create table questions (
  id            uuid primary key default gen_random_uuid(),
  statement     text not null,
  is_true       boolean not null,
  explanation   text not null,
  difficulty    difficulty not null,
  topic         text not null,
  source_url    text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table answer_events (
  id            bigint generated always as identity primary key,
  session_id    uuid not null,
  question_id   uuid not null references questions(id),
  answer        boolean not null,
  correct       boolean not null,
  time_ms       integer,
  created_at    timestamptz not null default now()
);

create index on answer_events (question_id);
create index on questions (difficulty) where active;

create view question_stats as
select q.id, q.statement, q.difficulty, q.topic,
       count(e.id) as total_answers,
       round(100.0 * avg(case when e.correct then 1 else 0 end), 1) as hit_rate
from questions q left join answer_events e on e.question_id = q.id
group by q.id;

-- RLS sem políticas públicas: acesso só via service role (servidor).
alter table questions enable row level security;
alter table answer_events enable row level security;
revoke all on question_stats from anon, authenticated;
