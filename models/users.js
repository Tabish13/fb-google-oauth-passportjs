var connection = require('../dbhandler/dbconnection');
var moment = require('moment');

function user(){
	this.create = function(userDetails, cb){
		var updateDetails = {
              "displayName":userDetails.displayName,
              "accessToken":userDetails.accessToken,
              "refreshToken":userDetails.refreshToken,
              "lastLoginAt":new moment().valueOf()
		}
		connection.acquire(function(err, con){
			var query = "insert into Users set ? ON DUPLICATE KEY UPDATE ?"//fbId = '"+userDetails.fbId+"'";
			if(!err){
				con.query(query, [userDetails, updateDetails], function(err, result){
					con.release();
					console.log("dbResult: "+JSON.stringify(result));
					cb(err, result);
				});
			}else{
				cb(err, null);
			}
		});
	};
	this.getUser = function(fbId, cb){
		connection.acquire(function(err, con){
			var query = 'SELECT * FROM Users WHERE authId = ? limit 1';
			if(!err){
				con.query(query, fbId, function(err, result){
					con.release();
					
					cb(err, result);
					//cb({"msg":"No data found"}, null);
				});
			}else{
				cb(err, null);
			}
		});
	};
}
module.exports = new user();