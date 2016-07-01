var src = process.cwd() + '/src/';
var config = require(src + 'config/config');

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ServicePasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require(src + 'model/user');
var Service = require(src + 'model/service');
var AccessToken = require(src + 'model/accessToken');
var RefreshToken = require(src + 'model/refreshToken');

/**
 * passport session setup
 * used to serialize the user for the session
 */
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

/**
 * passport session setup
 * used to deserialize the user
 */
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/**
 * ServicePasswordStrategy
 */
passport.use(new ServicePasswordStrategy(
    function (serviceId, serviceSecret, done) {
        Service.findOne({serviceId: serviceId}, function (err, service) {
            if (err) {
                return done(err);
            }

            if (!service) {
                return done(null, false);
            }

            if (service.serviceSecret !== serviceSecret) {
                return done(null, false);
            }

            return done(null, service);
        });
    }));

/**
 * BearerStrategy
 */
passport.use(new BearerStrategy(
    function (accessToken, done) {
        AccessToken.findOne({token: accessToken}, function (err, token) {

            if (err) {
                return done(err);
            }

            if (!token) {
                return done(null, false);
            }

            /* TOKEN LIFE
            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {

                AccessToken.remove({token: accessToken}, function (err) {
                    if (err) {
                        return done(err);
                    }
                });

                return done(null, false, {message: 'Token expired'});
            }*/

            /*User.findById(token.userId, function (err, user) {

                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {message: 'Unknown user'});
                }

                var info = {scopes: token.scopes};
                done(null, user, info);
            });*/

            var info = {scopes: token.scopes};

            console.log("INFO: " + info);
            done(null, true, info);
        });
    }));

/**
 * LOCAL LOGIN
 */
passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        process.nextTick(function () {
            User.findOne({'local.username': username}, function (err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                else
                    return done(null, user);
            });
        });
    }));

/**
 * LOCAL SIGNUP
 */
passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, username, password, done) {
        process.nextTick(function () {
            User.findOne({'local.username': username}, function (err, existingUser) {

                if (err)
                    return done(err);
                if (existingUser)
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                if (req.user) {
                    var user = req.user;
                    user.local.username = username;
                    user.local.password = user.generateHash(password);
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
                else {
                    var newUser = new User();
                    console.log(password);
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function (err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }
            });
        });
    }));

/**
 * FACEBOOK
 */
passport.use(new FacebookStrategy({
        clientID: config.get('configAuth:facebookAuth:clientID'),
        clientSecret: config.get('configAuth:facebookAuth:clientSecret'),
        callbackURL: config.get('configAuth:facebookAuth:callbackURL'),
        passReqToCallback: true

    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            if (!req.user) {
                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.username = profile.displayName;

                            user.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.username = profile.displayName;

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                console.log(profile);
                var user = req.user;
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.username = profile.displayName;

                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

/**
 * TWITTER
 */
passport.use(new TwitterStrategy({
        consumerKey: config.get('configAuth:twitterAuth:consumerKey'),
        consumerSecret: config.get('configAuth:twitterAuth:consumerSecret'),
        callbackURL: config.get('configAuth:twitterAuth:callbackURL'),
        passReqToCallback: true

    },
    function (req, token, tokenSecret, profile, done) {
        process.nextTick(function () {
            if (!req.user) {
                User.findOne({'twitter.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        if (!user.twitter.token) {
                            user.twitter.token = token;
                            user.twitter.username = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user = req.user;
                user.twitter.id = profile.id;
                user.twitter.token = token;
                user.twitter.username = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

/**
 * GOOGLE
 */
passport.use(new GoogleStrategy({
            clientID: config.get('configAuth:googleAuth:clientID'),
            clientSecret: config.get('configAuth:googleAuth:clientSecret'),
            callbackURL: config.get('configAuth:googleAuth:callbackURL'),
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                if (!req.user) {
                    User.findOne({'google.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.username = profile.displayName;
                                user.google.email = profile.emails[0].value;

                                user.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        } else {
                            var newUser = new User();
                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.username = profile.displayName;
                            newUser.google.email = profile.emails[0].value;

                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    var user = req.user;
                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.username = profile.displayName;
                    user.google.email = profile.emails[0].value;
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }
    )
);
