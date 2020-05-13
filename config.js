var config = {
environment:"development",
development: {
    mysql:{
          "host": "localhost",
          "user": "root",
          "password": "root",
          "database" : "lead",
          "connectionLimit": 10,
          "acquireTimeout" : 10000
    }
},
production: {
    mysql:{
          "host": "localhost",
          "user": "root",
          "password": "root",
          "database" : "lead",
          "connectionLimit": 10,
          "acquireTimeout" : 10000
    }
},
fbapp: {
    CLIENT_ID: "ID",//+"&target=_top",
    CLIENT_SECRET: "SECRET",
    CALLBACK_URL: "http://localhost:3000/auth/facebook/callback"
},
googleapp:{
    clientID: "ID.apps.googleusercontent.com",
    clientSecret: "SECRET",
    callbackURL: "http://localhost:3000/auth/google/callback"
},
secretkey : "project"
};
module.exports = config;
