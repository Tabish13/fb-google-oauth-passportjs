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
    CLIENT_ID: "744961065707288",//+"&target=_top",
    CLIENT_SECRET: "378de4e2cedfafa7dd257d6649258e5b",
    CALLBACK_URL: "http://localhost:3000/auth/facebook/callback"
},
googleapp:{
    clientID: "973465643843-nttb5ho12k3gv3db3v99t5c9iup8tbq6.apps.googleusercontent.com",
    clientSecret: "po0bIsUqHwtOhrCVlwcwiptE",
    callbackURL: "http://localhost:3000/auth/google/callback"
},
secretkey : "project"
};
module.exports = config;