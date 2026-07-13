create table if not exists players (
  id serial primary key,
  name text unique not null,
  account text
);

create table if not exists games (
  id serial primary key,
  game_date date not null,
  date_approx boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id serial primary key,
  game_id int not null references games(id) on delete cascade,
  player_id int not null references players(id) on delete cascade,
  buy_in numeric(10,2) not null default 0,
  cash_out numeric(10,2) not null default 0
);

create index if not exists entries_game_idx on entries(game_id);
create index if not exists entries_player_idx on entries(player_id);

create table if not exists settlements (
  id serial primary key,
  from_player_id int not null references players(id) on delete cascade,
  to_player_id int not null references players(id) on delete cascade,
  amount numeric(10,2) not null,
  settled_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists settlements_from_idx on settlements(from_player_id);
create index if not exists settlements_to_idx on settlements(to_player_id);

