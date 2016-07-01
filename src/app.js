var src = process.cwd() + '/src/';
require(src + 'auth/auth');
var log = require(src + 'log/log')(module);

var users = require(src + 'routes/users');
var services = require(src + 'routes/services');
var oauth = require(src + 'routes/oauth');
var config = require(src + 'config/config');

module.exports = function (app, passport) {

    //app.use('/api/users', users);
    app.use('/api/services', services);
    app.use('/api/tokens', oauth);


    /**
     * Index
     */
    app.get('/', function (req, res) {
        res.render('index', {title: config.get('title')});
    });

    /**
     * Home
     */
    app.get('/home', function (req, res) {
        res.render('home', {title: config.get('title'), user: req.user});
    });

    /**
     * Profile
     */
    app.get('/profile', isLoggedIn, function (req, res) {
        //console.log(req.user);
        res.render('api/authentication/profile', {title: config.get('title'), user: req.user});
    });

    /**
     * Logout
     */
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    /******************** AUTHENTICATE (FIRST LOGIN) ********************/
    /**
     * GET Login
     */
    app.get('/login', function (req, res) {
        res.render('api/authentication/login', {message: req.flash('loginMessage')});
    });

    /**
     * POST Login
     */
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));

    /**
     * POST loginExternal
     */
    app.post('/loginExternal', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            //console.log(req.query);
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect((req.query.callbackError != undefined) ? req.query.callbackError : config.get('configAuth:localAuth:callbackError'));
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                return res.redirect((req.query.callbackSuccess != undefined) ? req.query.callbackSuccess : config.get('configAuth:localAuth:callbackSuccess'));
            });
        })(req, res, next);
    });

    /**
     * GET Signup
     */
    app.get('/signup', function (req, res) {
        res.render('api/authentication/signup', {message: req.flash('loginMessage')});
    });

    /**
     * POST Signup
     */
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    /**
     * GET Authentication Facebook
     */
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    /**
     * Callback Facebook
     */
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));

    /**
     * GET Authentication Twitter
     */
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    /**
     * Callback Twitter
     */
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));


    /**
     * GET Authentication Google
     */
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    /**
     * Callback Google
     */
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));

    /******************** AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) ********************/
    /**
     * GET Authentication Local
     */
    app.get('/connect/local', function (req, res) {
        res.render('api/authentication/connect-local');
    });

    /**
     * POST Authentication Local
     */
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/connect/local',
        failureFlash: true
    }));

    /**
     * Authentication Facebook
     */
    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

    /**
     * Callback Facebook
     */
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));

    /**
     * Authentication Twitter
     */
    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));

    /**
     * Callback Twitter
     */
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));

    /**
     * Authentication Google
     */
    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

    /**
     * Callback Google
     */
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));

    /******************** UNLINK ACCOUNTS ********************/
    /**
     * Unlink Local
     */
    app.get('/unlink/local', function (req, res) {
        var user = req.user;
        user.local.username = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    /**
     * Unlink Facebook
     */
    app.get('/unlink/facebook', function (req, res) {
        var user = req.user;
        user.facebook.id = undefined;
        user.facebook.token = undefined;
        user.facebook.email = undefined;
        user.facebook.name = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    /**
     * Unlink Twitter
     */
    app.get('/unlink/twitter', function (req, res) {
        var user = req.user;
        user.twitter.id = undefined;
        user.twitter.token = undefined;
        user.twitter.displayName = undefined;
        user.twitter.username = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    /**
     * Unlink Google
     */
    app.get('/unlink/google', function (req, res) {
        var user = req.user;
        user.google.id = undefined;
        user.google.token = undefined;
        user.google.email = undefined;
        user.google.name = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

    /**
     * DELETE User
     */
    app.get('/delete', function (req, res) {
        var user = req.user;
        user.remove(function (err) {
            res.redirect('/');
        });
    });

    /**
     * catch 404 and forward to error handler
     */
    app.use(function (req, res, next) {
        res.status(404);
        log.debug('%s %d %s', req.method, res.statusCode, req.url);
        res.json({
            error: 'Not found'
        });
        return;
    });

    /**
     * Error handlers
     */
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        log.error('%s %d %s', req.method, res.statusCode, err.message);
        res.json({
            error: err.message
        });
        return;
    });
};

//
/**
 * route middleware to ensure user is logged in
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}