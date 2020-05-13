create database authtest;

create table user(
email_id varchar(255) NOT NULL UNIQUE,
name varchar(255) NOT NULL ,
password varchar(255) NOT NULL, 
PRIMARY KEY (email_id)
);
/*id int NOT NULL AUTO_INCREMENT,*/