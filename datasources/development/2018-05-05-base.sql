drop table if exists prices;
drop table if exists bet_event;
drop table if exists receptionist;
drop table if exists bet_data;

create table receptionist (
  id      int           not null auto_increment,
  cr_time timestamp     not null default current_timestamp(),
  name    varchar(1024) not null,
  primary key (id)
)
  engine = innodb, charset = utf8;

create table bet_event (
  id              int           not null auto_increment,
  cr_time         timestamp     not null default current_timestamp(),
  event_id        int           not null,
  label           varchar(1024) not null,
  receptionist_id int           not null,
  foreign key (receptionist_id) references receptionist (id),
  unique id (event_id),
  primary key (id)
)
  engine = innodb, charset = utf8;

create table prices (
  id           int            not null auto_increment,
  cr_time      timestamp      not null default current_timestamp(),
  bet_event_id int            not null,
  bet_price_id bigint         not null,
  label        varchar(1024)  not null,
  bet          decimal(14, 4) not null,
  json_data    blob           null,
  primary key (id),
  unique key (bet_price_id),
  foreign key (bet_event_id) references bet_event (id)
)
  engine = innodb, charset = utf8;

insert into receptionist (name, id) values ('marathonbet', 1);
