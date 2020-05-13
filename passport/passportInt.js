var passport = require('passport');
    //FacebookStrategy = require('passport-facebook').Strategy;
var userModel = require('../models/users.js');

function init() {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("serialize: "+JSON.stringify(user));
         //user = {"id":"123","user":"tabish"};
        done(null, user.authId);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        // to do get the user id or app if and find id it exist
        userModel.getUser(id, function(err, result){
          if(!err){
            console.log("deserialize: "+JSON.stringify(result));
            done(null, result);    
          }else{
            console.log("deserializeerr: "+JSON.stringify(err));
            done(err, null);
          }
        });
        //done(null, id);
        
    });
}

exports.init = init;