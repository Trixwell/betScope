const MARATHON_BET_ID = 1;
const isValidJson = require('is-valid-json');
exports.init = function (dbConnection) {
    this.dbo = dbConnection;

    return this;
};

exports.update = function () {
    const https = require('https');

    https.get('https://www.marathonbet.com/en/live/popular?pageAction=default', (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let json_data = JSON.parse(data);
            let react_data = JSON.parse(json_data[1].val);
            let matches = react_data['liveMenuEvents'].childs;

            function getEvents(child) {
                if (child.type === 'event') {
                    return {
                        name: child.label,
                        id: child.uid,
                    }
                }

                let events = [];
                if (child.childs && child.childs.length > 0) {
                    child.childs.forEach((event) => {
                        let data = getEvents(event);

                        if (Array.isArray(data)) {
                            events.push(data[0]);
                        } else {
                            events.push(data);
                        }
                    });
                }

                return events;
            }


            let all_events = [];
            matches.forEach((match) => {
                let data = getEvents(match);
                if (Array.isArray(data)) {
                    all_events = all_events.concat(data);
                } else {
                    all_events.push(data);
                }
            });

            all_events.forEach((event) => {
                exports.loadFullInfo(event);
            });
        });
    }).on('error', (err) => {
        console.log('ERROR', err);
    });
};

exports.loadFullInfo = function (event) {
    const https = require('https');
    const parser = require('fast-html-parser');

    let insert_prices = {
        dbo: this.dbo,
        bet_event_id: false,
        prices: false,
        load_prices: function (prices) {
            this.prices = prices;
            if (this.bet_event_id) {
                this.create_prices();
            }
        },
        load_event: function (bet_id) {
            this.bet_event_id = bet_id;

            if (this.prices) {
                this.create_prices();
            }
        },
        create_prices: function () {
            this.prices.forEach((price) => {
                this.dbo.query(
                    'replace into prices (bet_event_id, label, bet, json_data, bet_price_id) values(?)',
                    [
                        [
                            this.bet_event_id, price.label, price.bet, price.json_data, price.bet_price_id
                        ]
                    ],
                    (err) => {
                        if (err) {
                            console.log('Error inserting price: ', err);
                        }
                    }
                );
            });
        }
    };

    this.dbo.query('select id from bet_event where event_id = ?', event.id, (err, result, fields) => {
        if (result.length) {
            insert_prices.load_event(result[0].id);
        } else {
            this.dbo.query('replace into bet_event (event_id, label, receptionist_id) values(?)', [
                [event.id, event.name, MARATHON_BET_ID]
            ], (err, result, fields) => {
                insert_prices.load_event(result.insertId);
            });
        }
    });

    https.get(
        'https://www.marathonbet.com/en/live/' + event.id + '?pageAction=default', (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                if (isValidJson(data)) {
                    JSON.parse(data).forEach((row) => {
                        if (row.replace === 'inner') {
                            let dom = parser.parse(row.content);
                            let all_prices = dom.querySelectorAll('.price');

                            let prices = [];
                            all_prices.forEach((e) => {
                                let data_sel = JSON.parse(e.attributes['data-sel']);
                                prices.push({
                                    bet_price_id: data_sel.cid,
                                    json_data: e.attributes['data-sel'],
                                    label: data_sel.sn + " | " + data_sel.mn,
                                    bet: data_sel.epr
                                });
                            });

                            insert_prices.load_prices(prices);
                        }
                    });
                }
            });
        }).on('error', (err) => {
        console.log('ERROR', err);
    });
};