var config = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'authtest',
        connectionLimit: 20,
        acquireTimeout: 1000,
        multipleStatements: true
    };
var mysql = require('mysql');

function Connection() {
    this.pool = null;

    this.init = function() {
        this.pool = mysql.createPool(config);
        console.log('database connection established');
    };

    this.acquire = function(callback) {
        this.pool.getConnection(function(err, connection) {
            callback(err, connection);
        });
    };

    this.format = mysql.format;
}

module.exports = new Connection();