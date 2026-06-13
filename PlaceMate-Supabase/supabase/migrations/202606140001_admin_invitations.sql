create extension if not exists pgcrypto;

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  role text not null default 'SUPER_ADMIN',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz null
);

create index if not exists admin_invitations_email_idx
  on public.admin_invitations (lower(email));

create index if not exists admin_invitations_status_idx
  on public.admin_invitations (status);

create index if not exists admin_invitations_expires_at_idx
  on public.admin_invitations (expires_at);

create index if not exists admin_invitations_created_by_idx
  on public.admin_invitations (created_by);

create or replace function public.set_admin_invitations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_invitations_set_updated_at on public.admin_invitations;

create trigger admin_invitations_set_updated_at
before update on public.admin_invitations
for each row
execute function public.set_admin_invitations_updated_at();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  ip_address text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_user_id_idx
  on public.audit_logs (actor_user_id);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

create index if not exists audit_logs_entity_type_idx
  on public.audit_logs (entity_type);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

alter table public.admin_invitations enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Super admins can view invitations" on public.admin_invitations;
create policy "Super admins can view invitations"
on public.admin_invitations
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'SUPER_ADMIN'
  )
);

drop policy if exists "Super admins can manage invitations" on public.admin_invitations;
create policy "Super admins can manage invitations"
on public.admin_invitations
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'SUPER_ADMIN'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'SUPER_ADMIN'
  )
);

drop policy if exists "Super admins can view audit logs" on public.audit_logs;
create policy "Super admins can view audit logs"
on public.audit_logs
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'SUPER_ADMIN'
  )
);
