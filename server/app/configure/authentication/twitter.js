'use strict';

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');

module.exports = function (app) {

    const twitterConfig = app.getValue('env').TWITTER;

    const twitterCredentials = {
        consumerKey: twitterConfig.consumerKey,
        consumerSecret: twitterConfig.consumerSecret,
        callbackUrl: twitterConfig.callbackUrl
    };

    const createNewUser = function (token, tokenSecret, profile) {
        return UserModel.create({
            twitter: {
                id: profile.id,
                username: profile.username,
                token: token,
                tokenSecret: tokenSecret
            }
        });
    };

    const updateUserCredentials = function (user, token, tokenSecret, profile) {

        user.twitter.token = token;
        user.twitter.tokenSecret = tokenSecret;
        user.twitter.username = profile.username;

        return user.save();

    };

    const verifyCallback = function (token, tokenSecret, profile, done) {

        UserModel.findOne({'twitter.id': profile.id}).exec()
            .then(function (user) {
                if (user) { // If a user with this twitter id already exists.
                    return updateUserCredentials(user, token, tokenSecret, profile);
                } else { // If this twitter id has never been seen before and no user is attached.
                    return createNewUser(token, tokenSecret, profile);
                }
            }).then(function (user) {
                done(null, user);
            }, function (err) {
                console.error('Error creating user from Twitter authentication', err);
                done(err);
            });

    };

    passport.use(new TwitterStrategy(twitterCredentials, verifyCallback));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/');
        });

};
