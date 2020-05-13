var express = require('express');
var router = express.Router();
var { URL } = require('url');
var request = require("request");
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var queries = require("../db/queries.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    
    res.render('googleauth', { title: 'TeamUpright' });
});

var passport = require('passport');

var passportFb = require('../passport/passportFb.js');
passportFb.init();
router.get('/auth/facebook',  passport.authenticate('facebook'));

/*router.get('/auth/facebook',  function(req, res){
    passport.authenticate('facebook', function(data){
        console.log(data);
    })   
}); */

router.get('/auth/facebook/callback',
passport.authenticate('facebook', { successRedirect: '/fb/authenticated', failureRedirect: '/' }));





router.get('/fb/authenticated', isValidUser, function(req, res){
    console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
    console.log(req.cookies);
    console.log(req.user[0].accessToken);
     var secretkey = 'secret';
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    sendMessage('http://localhost:4333', 'fullauth', req.cookies.userId, secretkey, ["welcome "+req.user[0].displayName], req.user[0].accessToken, true, null, true,  req.headers.cookie, function(err, success) {
        if (!err) {
            //Success
            res.render('successfb');
        } else {
            //On error resend the login form with message  
            res.render('authpage', { title: 'TeamUpright', error: 'Something went wrong please login again.' });
        }
    });   
});




/*===========================Google Oauth route=================================*/
var passportGoogle = require('../passport/passportGoogle.js');
passportGoogle.init();
// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/google/authenticated', failureRedirect: '/' }));

/*==============================================================================*/

router.get('/google/authenticated', isValidUser, function(req, res){
    console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
    console.log(req.cookies);
    console.log(req.user[0].accessToken);
     var secretkey = 'secret';
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    sendMessage('http://localhost:4333', 'fullauth', req.cookies.userId, secretkey, ["welcome "+req.user[0].displayName], req.user[0].accessToken, true, null, true,  req.headers.cookie, function(err, success) {
        if (!err) {
            //Success
            res.render('successfb');
        } else {
            //On error resend the login form with message  
            res.render('authpage', { title: 'TeamUpright', error: 'Something went wrong please login again.' });
        }
    });   
});



function isValidUser(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
function sendMessage(url, botkey, userid, secretkey, message, token, webviewclose, deauthenticate, reloadchat, cookie, cb) {
    /*Params required
       @url url of the platform route to sendAuth
       @botkey botkey known while developing the bot so not passed in the page url
       @userid user id will be present in the page url find way to fetch the userid
       @secretkey secret key defined at the time of bot.js creation to match the callback request is from valid source
       @message message array to be sent to the bot 
       @token token to store in the browser which will be sent with eacch request to the user
       @webviewclose boolean value
       @deauthenticate optional when need to delete token from client browser
       @localStore key value to store in local
       @reloadchat reload chat window to show the history of user
    */
    /*
        @params
        {
            "botkey":"", @required
            "userid":"", @required
            "secretkey":"secretkey in bot.js", @required
            "message":["the msg"], @optional
            "token":"", @optional
            "webviewclose": true, @optional
            "deauthenticate":[array of local keys]/"string" @optional
            "localStore" 
            [{
                "key":"any key to store locally",
                "value":"value of key to store"
            }]
            "reloadchat":boolean
        }
    */
    request.post({
        url: url + "/sendAuth",
         headers: {
            'Cookie': cookie
        },
        json: {
            "botkey": botkey,
            "userid": userid,
            "secretkey": secretkey,
            "message": message,
            "token": token,
            "webviewclose": webviewclose,
            "deauthenticate": deauthenticate, //optional
            "reloadchat":reloadchat            
        }
    }, function(err, httpResponse, body) {
        if (!err && httpResponse.statusCode == 200) {
            cb(null, "success");
        } else {
            console.log(err);
            cb(err);
        }
    });
};

router.post("/checkauth", function(req, res, next) {
    console.log(req.headers.referer);
    var iframeUrl = new URL(req.headers.referer);
    console.log(iframeUrl.searchParams.get('userid'));
    var userId = iframeUrl.searchParams.get('userid');
    console.log(req.body);
    var secretkey = 'secret';
    console.log(req.headers);
    if (userId && req.body.username && req.body.password) {
        //Get user from username i.e email id in this case
        queries.get(req.body.username, function(err, result) {
            if (!err) {
                //Valid user than send auth token other wise reload with same page with error msg
                console.log("((((((((((((((((((((((((((");
                console.log(result);
                //encrypt the token which will be decrypted each time while accesing data
                //const secret = 'secret';
                 var encryptedPassword  = crypto.createHmac('sha256', secretkey)
                   .update(req.body.password)
                   .digest('hex');

                if (result && encryptedPassword == result[0].password) {

                    var encryptedToken = jwt.sign({ email: result[0].email_id, name: result[0].name}, secretkey);
                    //store the token in db to cross check later while authenticating
                    sendMessage('http://localhost:4333', 'fullauth', userId, secretkey, ["welcome "+result[0].name+" you are logged in."], encryptedToken, true, null, true,  req.headers.cookie, function(err, success) {
                        if (!err) {
                            //Success
                            res.render("Please wait while we login you.");
                        } else {
                            //On error resend the login form with message  
                            res.render('authpage', { title: 'TeamUpright', error: 'Something went wrong please login again.' });
                        }
                    });
                }else{
                    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$");
                    console.log(req);
                    res.render('authpage', { title: 'TeamUpright', error: 'Invalid Credentials.' });
                }
            } else {
                //On error resend the login form with message  
                res.render('authpage', { title: 'TeamUpright', error: 'Unable to login right now please try again.' });
            }
        });
    } else {
        //On error resend the login form with message 
         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$");
                    console.log(req);
        res.render('authpage', { title: 'TeamUpright', error: "Missing parameters." });
    }
    //Wait page after user submit the login webview
    //res.send("Please wait while we login you.");
});











router.post('/oauth/callback', function(req, res, next) {
    //console.log(req.body);
    console.log("::::::::::::::::::::::LLLLLLLLLLLLLLLLLLLLLLLLLL");
    console.log(req.headers);
    console.log(req.cookies);

    var userData = req.body.userdata;
    var seession = req.body.session;
    console.log("^^^^^^^^^^^^^^^^^^USER DATA^^^^^^^^^^^^^^");
    console.log(req.body);
    console.log(userData);
    var userMsg = userData.message.text;
    var lowerUserMsg;
    if (typeof userMsg == "string") {
        lowerUserMsg = userMsg.toLowerCase();
    }
    var refid = userData.message.refid;
    var msgid = userData.message["msgid"];
    var authtoken = seession.authtoken;
    if(req.isAuthenticated()){
      console.log("HEY I AM AUTHENTICAED");
      console.log(req.user);
      if(userMsg == "welcome" && refid == "1" && msgid == "1"){
//         res.json(["Welcome "+req.user[0].displayName],);
        res.json(["Welcome back Nirav Patel, Here is a quick look at your sales dashboard",
        {
            "type": "flexcollapse",
//                     "bgcolor": "grey",
            "cards": [
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>New Lead"},{ "type": "s5", "align": "cc", "color":"#000", "text": "3</b>"}],
                        ]
                    },
                    "details":  {
            "type": "flex",
            "data": [
// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "hr": "hr" ,"color": "#000"}],
// 					[{ "type": "s5", "align": "cl", "color":"#000","bgcolor": "#607D8B", "text": "Contact Name"},{ "type": "s5", "align": "cl", "bgcolor": "#607D8B", "color":"#000", "text": "Griffin Motors"}],
					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "1. Griffin Motors"}],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Sanjay Desai"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:9819859581'>9819859581</a>"}],					

// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Looking for AI Solution for Support."}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:sanjay@griffinmotors.com'>sanjay@griffinmotors.com</a>"}],					
					[{ "hr": "hr" }],
                    [{ "type": "fill_button", "buttons": [{"type":"overlay","text":"Mark Active"}, "Dormant"] }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],


// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "hr": "hr" ,"color": "#000"}],
					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "2. Cannon"}],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Contact Name"},{ "type": "s5", "align": "cl", "color":"#000", "text": "Cannon"}],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Rajesh Parab"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:9820449426'>9820449426</a>"}],					
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Need Custom Mobile App for Dealer."}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:rajesh@cannon.com'>rajesh@cannon.com</a>"}],					
					[{ "hr": "hr" }],
                    [{ "type": "fill_button", "buttons": ["Mark Active", "Dormant"] }],

// 					[{ "hr": "hr" ,"color": "#000"}],
// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "3. Neptunetworks"}],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Contact Name"},{ "type": "s5", "align": "cl", "color":"#000", "text": "Neptunetworks"}],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Rahul Jain"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:9082080473'>9082080473</a>"}],					
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Website for newly launched business."}],					
// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:rahul@neptunetworks.com'>rahul@neptunetworks.com</a>"}],					
					[{ "hr": "hr" }],
                    [{ "type": "fill_button", "buttons": ["Mark Active", {"type":"overlay","text":"Dormant"}] }],
// 					[{ "hr": "hr" ,"color": "#000"}],
            ]
        }

                }],
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>Active Prospect"},{ "type": "s5", "align": "cc", "color":"#000", "text": "10</b>"}],

                        ]
                    },
                    "details": {
            "type": "flex",
            "data": [


            ]
        }
                }],
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>Qualified"},{ "type": "s5", "align": "cc", "color":"#000", "text": "6</b>"}],

                        ]
                    },
                    "details": {
                        "type": "flex",
                        "data": [


                        ]
                    }
                }],
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>Proposal Sent"},{ "type": "s5", "align": "cc", "color":"#000", "text": "2</b>"}],					

                        ]
                    },
                    "details":  {
            "type": "flex",
            "data": [
// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "hr": "hr" ,"color": "#000"}],
// 					[{ "type": "s5", "align": "cl", "color":"#000","bgcolor": "#607D8B", "text": "Contact Name"},{ "type": "s5", "align": "cl", "bgcolor": "#607D8B", "color":"#000", "text": "Griffin Motors"}],
					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "1. Riddle Industries"}],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Yash Mehta"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:9726352525'>9726352525</a>"}],					

// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "ML and AI Solution for Customer Acquisition"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:yash@riddle.com'>yash@riddle.com</a>"}],					
					[{ "hr": "hr" }],
                    [{ "type": "fill_button", "buttons": [{"type":"overlay","text":"Mark Won"}, "Dormant", "View Proposal"] }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],


// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "hr": "hr" ,"color": "#000"}],
					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "2. Spideradio"}],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Contact Name"},{ "type": "s5", "align": "cl", "color":"#000", "text": "Cannon"}],
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Rohan Jha"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:8473773371'>8473773371</a>"}],					
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Next Gen ERP Implementation."}],					
					[{ "hr": "hr" }],
					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:rohan@spideradio.com'>rohan@spideradio.com</a>"}],					
					[{ "hr": "hr" }],
                    [{ "type": "fill_button", "buttons": ["Mark Won", "Dormant", "View Proposal"] }],

// 					[{ "hr": "hr" ,"color": "#000"}],
// 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
// 					[{ "type": "s5", "align": "cl", "color":"white", "text": "" }],
// 					[{ "type": "s5", "align": "cl", "color":"#fff","bgcolor": "#303e45", "text": "3. Neptunetworks"}],
// // 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Contact Name"},{ "type": "s5", "align": "cl", "color":"#000", "text": "Neptunetworks"}],
// 					[{ "hr": "hr" }],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Rahul Jain"}],					
// 					[{ "hr": "hr" }],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='tel:9082080473'>9082080473</a>"}],					
// // 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Email"},{ "type": "s5", "align": "cl", "color":"#000", "text": "nirav@teamupright.com"}],					
// 					[{ "hr": "hr" }],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "Website for newly launched business."}],					
// // 					[{ "type": "s5", "align": "cl", "color":"white",  "bgcolor": "#607D8B", "text": "" }],
// 					[{ "hr": "hr" }],
// 					[{ "type": "s5", "align": "cl", "color":"#000", "text": "<a href='mailto:rahul@neptunetworks.com'>rahul@neptunetworks.com</a>"}],					
// 					[{ "hr": "hr" }],
//                     [{ "type": "fill_button", "buttons": ["Mark Active", {"type":"overlay","text":"Dormant"}] }],
// 					[{ "hr": "hr" ,"color": "#000"}],
            ]
        }
                }],
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>Won"},{ "type": "s5", "align": "cc", "color":"#000", "text": "3</b>"}],					

                        ]
                    },
                    "details": {
                        "type": "flex",
                        "data": [


                        ]
                    }
                }],
                [{
                    "heading": {
                        "type": "flex",
						"bgcolor": "#f6f6f5",
                        "data": [
					[{ "type": "s5", "align": "cc", "color":"#000", "text": "<b>Dormant"},{ "type": "s5", "align": "cc", "color":"#000", "text": "8</b>"}],					

                        ]
                    },
                    "details": {
                        "type": "flex",
                        "data": [


                        ]
                    }
                }],                
            ]
        },],);
       }else if(userMsg == "Mark Active"){
        res.json([{
            "type": "overlay",
            "size":"overlayhalf", //overlayfull //overlayhalf
            // "align":"tl",
//             "close": true,
//             "back":true,
//              "header": { "size": "s4", "align": "cc","color": "#fff","bgcolor": "teal", "text": "Settings" },
            "code": 
            {
                "type": "flex",
                "bgcolor":"#303e45",
                // "bgimg":"img/bg1.jpg",
                "data": [            
                    //         [{
                //         "type": "link",
                //         "image": "http://www.livafluidfashion.com/birlaliva_cms/data_content/buyon_cat/1_20160916010657.jpg",
                //         "url": "http://www.livafluidfashion.com/buy-online/category/vibrant-tops-t-shirts-shirts"
                //     }],
                //         [{
                //         "type": "link",
                //         "image": "http://www.livafluidfashion.com/birlaliva_cms/data_content/buyon_cat/1_20160916010657.jpg",
                //         "url": "http://www.livafluidfashion.com/buy-online/category/vibrant-tops-t-shirts-shirts"
                //     }],
				[{ "type": "s5", "align": "cc", "color":"#fff", "text": "Griffin Motors marked as Active Prospect."}],					
				[{ "hr": "hr", "color":"white" }],
				[{ "type": "fill_button", "buttons": [{ "type": "close","text": "OK" }]}],  
//                 [{
//                     "type": "actionable",
//                     "displaytext": { "size": "s4", "align": "cc", "color": "#fff", "text": "Ok" },
//                     "overlay":"true",
//                     "payload": "overlay2"
//                 }],
//                 [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Chats" }],
//                 [{ "hr": "hr" }],
//                 // [{ "type": "s4", "align": "tl", "text": "Notifications" }],
//                 // [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Data and storage usage" }],
//                 [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Invite a friend" }],
// 
//                 [{ "hr": "hr" }],
//                 [{ "type": "fill_button", "align": "cc", "buttons": [
//                 { "type": "close",
//                 // "payload":"hey",
//                  "text": "Start Chatting" },{"type":"overlay","text":"overlay2"},
//                  {"type":"closeall",
//                  // "payload":"hey", 
//                  "text": "Close All" }] }]
            ]
         }
        }]);       		
       }else if(userMsg == "Dormant"){
        res.json([{
            "type": "overlay",
            "size":"overlayhalf", //overlayfull //overlayhalf
            // "align":"tl",
//             "close": true,
//             "back":true,
//              "header": { "size": "s4", "align": "cc","color": "#fff","bgcolor": "teal", "text": "Settings" },
            "code": 
            {
                "type": "flex",
                "bgcolor":"#303e45",
                // "bgimg":"img/bg1.jpg",
                "data": [            
                    //         [{
                //         "type": "link",
                //         "image": "http://www.livafluidfashion.com/birlaliva_cms/data_content/buyon_cat/1_20160916010657.jpg",
                //         "url": "http://www.livafluidfashion.com/buy-online/category/vibrant-tops-t-shirts-shirts"
                //     }],
                //         [{
                //         "type": "link",
                //         "image": "http://www.livafluidfashion.com/birlaliva_cms/data_content/buyon_cat/1_20160916010657.jpg",
                //         "url": "http://www.livafluidfashion.com/buy-online/category/vibrant-tops-t-shirts-shirts"
                //     }],
				[{ "type": "s5", "align": "cc", "color":"#fff", "text": "Neptunetworks marked as Dormant."}],					
				[{ "hr": "hr", "color":"white" }],
				[{ "type": "fill_button", "buttons": [{ "type": "close","text": "OK" }]}],  
//                 [{
//                     "type": "actionable",
//                     "displaytext": { "size": "s4", "align": "cc", "color": "#fff", "text": "Ok" },
//                     "overlay":"true",
//                     "payload": "overlay2"
//                 }],
//                 [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Chats" }],
//                 [{ "hr": "hr" }],
//                 // [{ "type": "s4", "align": "tl", "text": "Notifications" }],
//                 // [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Data and storage usage" }],
//                 [{ "hr": "hr" }],
//                 [{ "type": "s4", "align": "tl", "text": "Invite a friend" }],
// 
//                 [{ "hr": "hr" }],
//                 [{ "type": "fill_button", "align": "cc", "buttons": [
//                 { "type": "close",
//                 // "payload":"hey",
//                  "text": "Start Chatting" },{"type":"overlay","text":"overlay2"},
//                  {"type":"closeall",
//                  // "payload":"hey", 
//                  "text": "Close All" }] }]
            ]
         }
        },]);    

       }else if(userMsg == "View Proposal"){
        res.json([{
                     "type": "flex",
                     "data": [
				[{ "type": "html", "align": "cl", "color": "#000", "code": '<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRUT4wsLhY9p5G9lVwmip9LUveUDRjn3NKIM_EJbFcuDg3ajYYf5psO7RoMx9qzgBlB7eQDhopCn_LT/embed?start=false&loop=false&delayms=20000" frameborder="0" width="200" height="200" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>' },]
                         ],
                 }]);       		


       }else if(userMsg == "balance"){
        res.json(["10K Rupees"]);       		
       }else if(userMsg == "abc"){
        res.json(["10K Rupees"]);       		


       }else if(userMsg == "logout"){
                req.logout();
             sendMessage('http://localhost:4333', 'fullauth', userData.id, 'secret', ["Logged Out successfully."], null, false, "authtoken", true, req.headers.cookie, function(err, success) {
            if(!err){
                res.json({
                    "type": "webview",
                    "enable": "true",
                    "url": "http://localhost:3000/"
                });
            }
        });
       }else{
        res.json(["I have interpreted "+userMsg]);
       }
    }else{
        if(lowerUserMsg == "about"){
            res.json(["I am in about "]);
        }else{
            res.json({
                "type": "webview",
                "enable": "true",
                "url": "http://localhost:3000/"
            });
        }  
    }
});

/*Normal Login Callback Endpoint*/
router.post('/', function(req, res, next) {
    //console.log(req.body);
    console.log("::::::::::::::::::::::LLLLLLLLLLLLLLLLLLLLLLLLLL");
    console.log(req.headers);
    console.log(req.cookies);

    var userData = req.body.userdata;
    console.log("^^^^^^^^^^^^^^^^^^USER DATA^^^^^^^^^^^^^^");
    console.log(req.body);
    console.log(userData);
    var userMsg = userData.message.text;
    var lowerUserMsg;
    if (typeof userMsg == "string") {
        lowerUserMsg = userMsg.toLowerCase();
    }
    var refid = userData.message.refid;
    var msgid = userData.message["msgid"];
    var authtoken = userData.authtoken;
console.log(authtoken);
if(authtoken){
    try{
    var decodedToken = jwt.verify(authtoken, 'secret');    
}catch(err){
     res.json({
            "type": "webview",
            "enable": "true",
            "url": "http://localhost:3000/"
        });    
}
}

console.log(decodedToken);
if(decodedToken && decodedToken.email && decodedToken.name){
    if(lowerUserMsg == "logout"){
        sendMessage('http://localhost:4333', 'fullauth', userData.id, 'secret', ["Logged Out successfully."], null, false, "authtoken", true, req.headers.cookie, function(err, success) {
            if(!err){
                res.json({
                    "type": "webview",
                    "enable": "true",
                    "url": "http://localhost:3000/"
                });
            }
        });
    }else{
        res.json({id:"123",data:["I have interpreted "+userMsg]});
        //res.json(["I have interpreted "+userMsg]);
    }
}else if(lowerUserMsg == "about"){
    res.json(["Hey about this.",{
                "type": "quick2",
                "question": "Please login.",
                "buttons": ["Login", "About"]
        }]);
}else if(lowerUserMsg == "login"){
    res.json({
            "type": "webview",
            "enable": "true",
            "url": "http://localhost:3000/"
        });
}else{
     res.json([{
            "type": "quick2",
            "question": "Please login.",
            "buttons": ["Login", "About"]
        }]);
}
   /* if (userMsg == "welcome" && refid == "1" && msgid == "1") {
        res.json([{
            "type": "flex",
            "header": ["", "", ""],
            "data": [
                ["Admin Login"],
                [{ "type": "html", "code": '<input type="text" name="aname" class="">' }],
                [{ "type": "html", "code": '<input type="password" name="apass" class="">' }],
                ['<input type="button" value="Submit" class="team-auth">']
            ]
        }]);
       
    } else {
        res.json(["you have token assuming you are valid user your token is " + authtoken]);
    }*/
});


module.exports = router;