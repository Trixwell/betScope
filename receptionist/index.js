exports.init = function (dbConnection) {
    this.dbo = dbConnection;

    return this;
};

exports.getReceptionist = function (name) {
    console.log('load rec %s', name);
    obj = require('./lib/marathonbet');
    obj.init(this.dbo);
    return obj;
};