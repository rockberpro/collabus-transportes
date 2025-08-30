create table profiles (
  id uuid references auth.users on delete cascade primary key,
  fullname text,
  created_at timestamp default now()
);
