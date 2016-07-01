/*var express = require('express');
var passport = require('passport');
var router = express.Router();

var src = process.cwd() + '/src/';
var log = require(src + 'log/log')(module);
var User = require(src + 'model/user');

/**
 * GET /api/users/info
 *
 *!/
router.get('/info', passport.authenticate('bearer', {session: false}),
    function (req, res) {
        var name;
        if (req.user.local.username)
            name = req.user.local.username;
        else if (req.user.facebook.name)
            name = req.user.facebook.name;
        else if (req.user.twitter.displayName)
            name = req.user.twitter.displayName;
        else if (req.user.google.email || req.user.google.name) {
            name = req.user.google.email;
            name = req.user.google.name;
        }

        res.json({
            user_id: req.user.userId,
            name: name,
            scopes: req.authInfo.scopes
        });
    }
);
module.exports = router;*/
