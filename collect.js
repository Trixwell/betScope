'use strict';

const mysql = require('mysql');
const factory = require('./receptionist');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cocacola321',
    database: 'bet_scope'
});
connection.connect();


function load() {
    factory
        .init(connection)
        .getReceptionist('marathonbet')
        .update();
    setTimeout(load, 3000);
}

load();