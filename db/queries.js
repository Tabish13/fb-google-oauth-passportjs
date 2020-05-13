const connection = require('./database.js');

function user() {

    this.create = function(model, cb) {
        //var query = "insert into basic set ? ON DUPLICATE KEY UPDATE ?? = ? , ?? = JSON_SET( ??, ?, ?) , ?? = ?";
        var query = "insert into user set ?";
        connection.acquire(function(err, con) {
            if (!err) {
                console.log("err", err);
                queryparams = [model];
                con.query(query, queryparams,
                    function(err, result) {
                        con.release();
                        cb(err, result);
                    });
            }else{
                console.log("*************DATABASE CONNECTION ERROR WHIL CREATE USER***********");
                cb(err);
            }
        });
    };

    this.get = function(emaiId, cb) {
        var query = 'select * from user where email_id="' + emaiId + '"';
        connection.acquire(function(err, con) {
            if (!err) {
                queryparams = [emaiId];
                con.query(query, queryparams,
                    function(err, result) {
                        con.release();
                        cb(err, result);
                    });
            } else {
                console.log("*************DATABASE CONNECTION ERROR WHIL GET USER***********");
                cb(err);
            }
        });
    };

    this.delete = function(cb) {
        connection.acquire(function(err, con) {
            con.query('DELETE FROM Article', function(err, result) {
                con.release();
                cb(err, result);
            });
        });
    };

}

module.exports = new user();