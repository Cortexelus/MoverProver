CREATE TABLE ${schema~}.move (
  id serial PRIMARY KEY,
  moveid text NOT NULL,
  owner text NOT NULL,
  movename text NOT NULL,
  islisted bool DEFAULT false,
  buyprice integer DEFAULT 0
);

CREATE TABLE ${schema~}.account (
  id serial PRIMARY KEY,
  accname text NOT NULL,
  fullname text NOT NULL,
  email text NOT NULL,
  mvp integer DEFAULT 10000
);
