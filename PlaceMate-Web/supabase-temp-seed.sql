-- Temporary PlaceMate demo data for the current schema.
-- Run this in Supabase SQL Editor if client-side seeding is blocked by RLS.

with target_institute as (
  select id from institutes order by created_at asc limit 1
),
seed_students as (
  insert into students (institute_id, full_name, email, mobile, department, year, cgpa, placement_status)
  select id, 'Aarav Reddy', 'aarav.reddy@example.edu', '9876543210', 'CSE', 4, 9.1, 'PLACED' from target_institute
  union all select id, 'Priya Sharma', 'priya.sharma@example.edu', '9876543211', 'IT', 4, 8.7, 'PLACED' from target_institute
  union all select id, 'Rohan Nair', 'rohan.nair@example.edu', '9876543212', 'ECE', 4, 8.2, 'NOT_PLACED' from target_institute
  union all select id, 'Ananya Iyer', 'ananya.iyer@example.edu', '9876543213', 'CSE', 4, 9.4, 'PLACED' from target_institute
  union all select id, 'Vikram Patel', 'vikram.patel@example.edu', '9876543214', 'MEC', 4, 7.6, 'NOT_PLACED' from target_institute
  on conflict do nothing
  returning id
),
seed_tpos as (
  insert into tpos (institute_id, full_name, email, mobile, designation)
  select id, 'Deepa Krishnan', 'deepa.krishnan@example.edu', '9876500001', 'Lead TPO' from target_institute
  union all select id, 'Manish Agarwal', 'manish.agarwal@example.edu', '9876500002', 'TPO' from target_institute
  on conflict do nothing
  returning id
),
seed_companies as (
  insert into companies (company_name, website, hr_email, package)
  values
    ('Northwind AI', 'https://northwind.ai', 'hr@northwind.ai', 22),
    ('Helios Systems', 'https://helios.example', 'campus@helios.example', 14),
    ('Cobalt Labs', 'https://cobaltlabs.example', 'talent@cobaltlabs.example', 11.5),
    ('Quanta Retail', 'https://quanta.example', 'placements@quanta.example', 7.8)
  on conflict do nothing
  returning id, company_name
),
company_rows as (
  select id, company_name from companies
  where company_name in ('Northwind AI', 'Helios Systems', 'Cobalt Labs')
),
seed_drives as (
  insert into placement_drives (institute_id, company_id, drive_name, drive_date, status)
  select ti.id, cr.id,
    case cr.company_name
      when 'Northwind AI' then 'ML Engineer'
      when 'Helios Systems' then 'Cloud SDE'
      else 'Backend Engineer'
    end,
    case cr.company_name
      when 'Northwind AI' then date '2026-06-28'
      when 'Helios Systems' then date '2026-07-04'
      else date '2026-07-12'
    end,
    case cr.company_name
      when 'Cobalt Labs' then 'completed'
      else 'published'
    end
  from target_institute ti
  cross join company_rows cr
  on conflict do nothing
  returning id
)
insert into applications (student_id, drive_id, status)
select s.id, d.id,
  case row_number() over ()
    when 1 then 'applied'
    when 2 then 'shortlisted'
    when 3 then 'selected'
    else 'rejected'
  end
from (select id from students order by created_at asc limit 4) s
cross join lateral (select id from placement_drives order by drive_date asc limit 1) d
on conflict do nothing;
