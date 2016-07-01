/**
 * Created by ricardomendes on 29/03/16.
 */

var src = process.cwd() + '/src/';
var config = require(src + 'config/config');

var log = require(src + 'log/log')(module);

var port = process.env.PORT || config.get('port') || 3000;

var express = require('express');
//var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var mongoose = require('mongoose');
var passport = require('passport');

var app = express();

/**
 * Database Configuration
 */
mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;
db.on('error', function (err) {
    log.error('Connection error MongoDB:', err.message);
});
db.once('open', function callback() {
    log.info("Connected to DB!");
});

/**
 * App Configuration
 */
app.set('views', src + 'views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({resave: true, saveUninitialized: true, secret: 'secretpasswordforproject_ieeta'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(src + 'public'));

/**
 * Routes
 */
require(src + 'app')(app, passport);

/**
 * Catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * Development error handler
 * will print stacktrace
 */
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
/**
 * Production error handler
 * no stacktraces leaked to user
 */
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(port, function () {
    log.info('Express server listening on ' + config.get('authentication:uri')+':' + port);
});

module.exports = app;

/**
 * MQTT Server
 * @type {exports|module.exports}
 */
var mosca = require('mosca');
var AuthMosca = require(process.cwd() + '/lib/AuthMosca.js');

var authSystem = new AuthMosca();

var ascoltatore = {
    //using ascoltatore
    type: 'mongo',
    url: config.get('mongoose:uri'),
    pubsubCollection: 'ascoltatori',
    mongo: {}
};

var moscaSettings = {
    port: config.get('mongoose:port'),
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Mongo,
        url: config.get('mongoose:uri')
    },
    http: {
        port: 3000,
        bundle: true,
        static: './'
    }
};

var server = new mosca.Server(moscaSettings);

server.on('ready', setup);

function setup() {
    server.authenticate = authSystem.authenticate();

    //server.authorizeSubscribe = authSystem.authorizeSubscribe();
    //server.authorizePublish = authSystem.authorizePublish();
    log.info('Mosca server is up and running')
}

server.on('clientConnected', function (client) {
    //log.info('client connected', client.id);
});

server.on('published', function (packet) {
    //log.info('Published', packet.payload);
});

