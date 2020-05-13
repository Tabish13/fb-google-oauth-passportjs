var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config.js');
var userModel = require('../models/users.js');
var moment = require('moment');
const uuidv1 = require('uuid/v1');
function init() {

    passport.use(new FacebookStrategy({
            clientID: config.fbapp.CLIENT_ID,
            clientSecret: config.fbapp.CLIENT_SECRET,
            callbackURL: config.fbapp.CALLBACK_URL
            //profileFields: ['emails']
        },
        function(accessToken, refreshToken, profile, done) {
            /*User.findOrCreate(..., function(err, user) {
              if (err) { return done(err); }
              done(null, user);
            });*/
            var userDetails = {
              "authId":"fb_"+profile.id,
              "displayName":profile.displayName,
              "accessToken":accessToken,
              "refreshToken":refreshToken,
              "lastLoginAt":new moment().valueOf(),
              "createdAt":new moment().valueOf(),
              "companyId":uuidv1()
            };
            console.log("fb accessToken: " + accessToken);
            console.log("fb refreshToken: " + refreshToken);
            console.log("fb Profile: " + JSON.stringify(profile));
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