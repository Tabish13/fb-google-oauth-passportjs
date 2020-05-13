var mysql = require('mysql');
var config = require('../config.js');
function Connection(){
	this.pool = null;
	//created when the server starts only once.
	this.init = function(){
		this.pool = mysql.createPool(config[config.environment].mysql);
		console.log('Database connection esatablished');
	};

	//called from where connection is needed..
	this.acquire = function(callback){
		this.pool.getConnection(function(err, connection) {
      	callback(err, connection);
	});
};
}
module.exports = new Connection();