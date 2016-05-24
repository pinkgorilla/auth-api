var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var toolkit = require('mean-toolkit');
app.use(toolkit.middlewares.enableCors);

var passport = require('passport');
app.use(passport.initialize());

var config = require('./config');
var jwt = require('mean-toolkit').passport.jwt;
jwt.strategy(function (payload, done) {
    return done(null, payload.user);
}, config.secret);

var morgan = require('morgan');
app.use(morgan('dev'));  

var authenticationRouter = require('./app/routers/authentication-router');
app.use('/authenticate', authenticationRouter);

var accountsRouter = require('./app/routers/accounts-router');
app.use('/accounts', accountsRouter);

var meRouter = require('./app/routers/me-router');
app.use('/me', meRouter);

app.use(toolkit.middlewares.resultFormatter);
app.use(toolkit.middlewares.errorFormatter);

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Magic happens at http://localhost:' + port); 