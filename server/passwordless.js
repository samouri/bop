'use strict'
var passwordless = require('passwordless');
var PasswordlessMongoStore = require('passwordless-mongostore');
var config = require('./config');
var email = require("emailjs");


var smtpServer  = email.server.connect({
  user: "boptoken@gmail.com",
  password: "boptest1234",
  host: "smtp.gmail.com",
  ssl: true,
  port: 465
});

var passwordlessWrapper = {

  setup: function(app) {
    passwordless.init(new PasswordlessMongoStore(config.pathToMongoDb, {
      server:     { auto_reconnect: true     },
      mongostore: { collection:     'tokens' }
    }));

    passwordless.addDelivery(
      function(tokenToSend, uidToSend, recipient, callback) {
        smtpServer.send({
          text:    'Hello!\nAccess your account here: http://'
          + config.host + '?token=' + tokenToSend + '&uid='
          + encodeURIComponent(uidToSend),
          from:    "boptoken@gmail.com",
          to:      recipient,
          subject: 'Token for ' + config.host
        }, function(err, message) {
          if(err) {
            console.log(err);
          }
          callback(err);
        });
      }
    );

    app.use(passwordless.sessionSupport());
    app.use(passwordless.acceptToken({
      successFlash: 'You are logged in. Welcome to Passwordless!',
      failureFlash: 'The supplied token is not valid (anymore). Please request another one.',
      successRedirect: '/'
    }));

    // For every request add user data and provide it to the view
    app.use(function(req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    });
  },

  sendToken: function sendToken(req, res, next) {
    passwordless.requestToken(
      function(user, delivery, callback) {
        callback(null, user);
      }, {"userField": "UserEmail"}
    )(req,res,next);
  },

  logout: function logout(req,res,next) {
    passwordless.logout()(req, res, next);
  }
}

module.exports = passwordlessWrapper;
