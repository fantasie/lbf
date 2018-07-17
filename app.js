var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config/config');
var logger = require('log4js').getLogger('app.js');

var app = express();
var env = process.env.NODE_ENV || 'production',
    dbConfig = require('./config/dbConfig')[env];
logger.info("run env: " + env);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for authentication
var expressSession = require('express-session');
var passport = require('passport'),
    passportHelper = require('./helper/passportHelper');
passportHelper(passport);

var redis = require('redis'),
    RedisStore = require('connect-redis')(expressSession);

// app.use(expressSession({
//     secret: config.session.secret,
//     resave: false,
//     saveUninitialized: true
// }));

var redisClient = redis.createClient(dbConfig.redis.port, dbConfig.redis.host);
redisClient.auth(dbConfig.redis.password);

var redisConfig = {
    host: dbConfig.redis.host,
    port: dbConfig.redis.port,
    prefix: "session:",
    db: 0,
    client: redisClient
};

app.use(expressSession({
    store: new RedisStore(redisConfig),
    secret: config.session.secret,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    key: 'sid',
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());
// var flash = require('connect-flash');
// app.use(flash());

// for route
var defaultRoutes = require('./routes/index'),
    accountRoutes = require('./routes/account'),
    codeRoutes = require('./routes/code');


app.use('/', defaultRoutes);
app.use('/account', accountRoutes);
app.use('/code', codeRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var responseHelper = require('./helper/responseHelper');
// development error handler
// will print stacktrace
if (env === 'development') {
    app.use(function(err, req, res, next) {
        var result = responseHelper.getDefaultResult(req);
        result.message = err.message;
        result.error = err;
        res.status(err.status || 500);
        res.render('error', result);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    var result = responseHelper.getDefaultResult(req);
    result.message = "Unexpected error occured. Please try in a moment.";
    result.error = err;
    res.status(err.status || 500);
    res.render('error', result);
});

app.listen(3000);
module.exports = app;
