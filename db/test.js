var database = require("./database.js");
database.init();
var queries = require("./queries.js");
var test = {
	email_id:"tabish1@teamupright.com", 
	name: "Tabish1",
	password :"test"
};
var crypto = require('crypto');

const secret = 'secret';
test.password = crypto.createHmac('sha256', secret)
                   .update(test.password)
                   .digest('hex');
queries.create(test , function(err, result){
	if(!err){
		console.log(result);
	}else{
		console.log(err);
	}
});