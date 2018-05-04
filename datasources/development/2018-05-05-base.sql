drop table if exists bet_data;
create table bet_data (
  id         int            not null AUTO_INCREMENT,
  cr_time    timestamp      not null default current_timestamp(),
  name       varchar(128)   not null,
  provider   varchar(128)   not null,
  coef_right decimal(14, 4) not null,
  coef_left  decimal(14, 4) not null,
  extra_info text           not null,
  primary key (id)
)
  engine = innodb, charset = utf8;
