var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../config.js');
var userModel = require('../models/users.js');
var moment = require('moment');
const uuidv1 = require('uuid/v1');

function init() {
    // Use the GoogleStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Google
    //   profile), and invoke a callback with a user object.
    passport.use(new GoogleStrategy({
            clientID: config.googleapp.clientID,
            clientSecret: config.googleapp.clientSecret,
            callbackURL: config.googleapp.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
        	var userDetails = {
              "authId":"g_"+profile.id,
              "displayName":profile.displayName,
              "accessToken":accessToken,
              "refreshToken":refreshToken,
              "lastLoginAt":new moment().valueOf(),
              "createdAt":new moment().valueOf(),
              "companyId":uuidv1()
            };
            console.log("g accessToken: " + accessToken);
            console.log("g refreshToken: " + refreshToken);
            console.log("g Profile: " + JSON.stringify(profile));
       
            userModel.create(userDetails, function(err, result){
              if(!err){
                console.log(result);
                done(null, userDetails);
              }else{
                console.log(err);
                done(err, null);
              }
            });  
        }
    ));
}
exports.init = init;