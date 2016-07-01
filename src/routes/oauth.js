var express = require('express');
var passport = require('passport');
var router = express.Router();
var crypto = require('crypto');

var src = process.cwd() + '/src/';
var log = require(src + 'log/log')(module);
var User = require(src + 'model/user');
var Service = require(src + 'model/service');
var AccessToken = require(src + 'model/accessToken');
var RefreshToken = require(src + 'model/refreshToken');

var config = require(src + 'config/config');

/**
 * GET /api/tokens
 */
router.get('/', isLoggedIn, function (req, res) {
    //AccessToken.find({"userId": req.user.userId}, function (err, accessTokens) {
    AccessToken.find({}, function (err, accessTokens) {
        if (!err) {
            return res.render('api/tokens/index', {
                title: config.get('title'),
                user: req.user,
                accessTokens: accessTokens
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.json({
                error: 'Server error'
            });
        }
    })
        //.populate('userId')
        .populate('serviceId');
});

/**
 * GET /api/tokens/addtoken
 */
router.get('/addtoken', isLoggedIn, function (req, res) {
        Service.find(function (err, services) {
            if (!err) {
                //console.log("userId: " + req.user.userId);
                //AccessToken.find({"userId": req.user.userId}, function (err, accessTokens) {
                AccessToken.find({}, function (err, accessTokens) {
                    return res.render('api/tokens/addToken', {
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
    }
);

/**
 * POST /api/tokens/addtoken
 */
router.post('/addtoken', isLoggedIn, function (req, res) {
        //console.log(req.body);
        var serviceId = req.body['serviceId'];
        var priceStrategy = req.body['priceStrategy'];
        var nameSetup = req.body['nameSetup'];

        //console.log(req.user);
        //User.findOne({'_id': req.user.userId}, function (err, user) {
        //    if (err) {
        //        return done(err);
        //    }
        Service.findOne({'_id': serviceId}, function (err, service) {
            if (err) {
                return done(err);
            }
            var model = {
                //userId: user.userId,
                serviceId: service._id,
                nameSetup: nameSetup,
                priceStrategy: priceStrategy
            };
            var token = generateTokens(model);
            res.json(token);
            //res.redirect('/api/tokens/');
        });
        //});
    }
);

module.exports = router;

/**
 * Destroys any old tokens and generates a new access and refresh token
 * @param data
 */
function generateTokens(data) {
    var refreshToken,
        refreshTokenValue,
        token,
        tokenValue;

    RefreshToken.remove(data);
    AccessToken.remove(data);

    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save();

    token.save(function (err) {
        if (err) {
            log.error(err);
            return log.error(err);
        }
    });
    return token;
}

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