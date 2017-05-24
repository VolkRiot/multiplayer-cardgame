// config/passport.js

// load all the things we need
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var db = require("../models");

// load the auth variables

if(!process.env.NODE_ENV){
  var secrets = require('../config/secrets.js');
}


module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);

    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.User.findAll(
                {
                    where: {id: id}
                }).then(function(dbUser) 
                {
                    var temp = dbUser[0].dataValues;
                    
                    var user = {user_name: temp.user_name, email: temp.email, wins: temp.wins, photo: temp.photo}
                    done(null, user);
                });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID        : process.env.google_client_id || secrets.secrets.CLIENT_ID,
        clientSecret    : process.env.google_client_secret || secrets.secrets.CLIENT_SECRET,
        callbackURL     : process.env.callback_url || secrets.secrets.CALLBACK_URL,
        passReqToCallback : true

    },
    function(req, token, refreshToken, profile, done) {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
                db.User.findAll(
                {
                    where: {googleID: profile.id}
                }).then(function(dbUser)
                {
                    if (dbUser.length > 0)
                    {
                        return done(null, dbUser[0]);;
                    }
                    else
                    {
                        db.User.create(
                        {
                        googleID : profile.id,
                        token : token,
                        user_name : profile.displayName,
                        email : profile.emails[0].value, // pull the first email
                        photo: profile.photos[0].value
                        }).then(function(dbUser)
                        {
                            return done(null, dbUser.dataValues);
                        });
                    }
                })
        });

    }));

};
