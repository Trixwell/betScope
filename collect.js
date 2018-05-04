'use strict';

const mysql = require('mysql');
const crypto = require('crypto');
const https = require('https');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cocacola321',
    database: 'bet_scope'
});
connection.connect();

function load() {
    https.get('https://www.marathonbet.com/en/live/popular?pageAction=default&_=1525474834960', (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let shasum = crypto.createHash('sha1');
            shasum.update(JSON.parse(data)[0].content);
            let params = [
                ['test', 'marathonbet', 0.5, 0.6, shasum.digest('hex')]
            ];
            connection.query('insert into bet_data (name, provider, coef_right, coef_left, extra_info) values (?)', params);

            setTimeout(load, 3000);
        });
    }).on('error', (err) => {
        console.log('ERROR', err);
        load();
    });
}

load();