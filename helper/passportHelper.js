var GoogleStrategy = require('passport-google-oauth20' ).Strategy,
    config = require('./../config/config'),
    bookshelfService = require('./../dao/bookshelfService'),
    logger = require('log4js').getLogger('helper/passportHelper.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
	    callbackURL: config.google.callbackUrl
        }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            var userId = profile.id + '@googleplus';
            bookshelfService.getUser(userId, function (err, user) {
                if (err) {
                    return done(err, null);
                }

                if (user) {
                    return done(null, user);
                }

                return bookshelfService.insertUser(profile, done);
            });
        });
    }));
};
