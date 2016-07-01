var express = require('express');
var passport = require('passport');
var router = express.Router();

var src = process.cwd() + '/src/';
var log = require(src + 'log/log')(module);
var Service = require(src + 'model/service');
var AccessToken = require(src + 'model/accessToken');
var config = require(src + 'config/config');

/**
 * GET /api/services
 */
router.get('/', isLoggedIn, function (req, res) {
    Service.find(function (err, services) {
        if (!err) {
            AccessToken.find({"userId": req.user.userId}, function (err, accessTokens) {
                return res.render('api/services/index', {
                    title: config.get('title'),
                    user: req.user,
                    services: services,
                    accessTokens: accessTokens
                });
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.json({
                error: 'Server error'
            });
        }
    });
});

/**
 * GET /api/services/addservice
 */
router.get('/addservice', isLoggedIn, function (req, res) {
        res.render('api/services/addService', {title: config.get('title'), user: req.user});
    }
);

/**
 * POST /api/services/addservice
 */
router.post('/addservice', isLoggedIn, function (req, res) {
        var name = req.body['name'];
        var serviceSecret = req.body['serviceSecret'];
        var urlCallback = req.body['urlCallback'];
        var priceStrategy = req.body['priceStrategy'];

        var service = new Service({
            //userId: req.user.userId,
            name: name,
            serviceSecret: serviceSecret,
            urlCallback: urlCallback,
            priceStrategy: priceStrategy
        });
        service.save(function (err, service) {
            if (err) {
                return log.error(err);
            }
            res.redirect('/api/services/');
        });
    }
);

/**
 * Authorization
 * */

/**
 * POST /api/services/info
 */
router.post('/info', passport.authenticate('bearer', {session: false}),
    function (req, res) {
        //var name;
        //if (req.user.local.username)
        //    name = req.user.local.username;
        //else if (req.user.facebook.name)
        //    name = req.user.facebook.name;
        //else if (req.user.twitter.displayName)
        //    name = req.user.twitter.displayName;
        //else if (req.user.google.email || req.user.google.name) {
        //    name = req.user.google.email;
        //    name = req.user.google.name;
        //}

        res.json({
            //user_id: req.user.userId,
            //name: name,
            channels: req.authInfo.scopes
        });
    }
);


module.exports = router;

/**
 * Route middleware to ensure user is logged in
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