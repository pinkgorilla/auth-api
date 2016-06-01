var factory = require('mongo-factory');
var config = require('./config');

factory.getConnection(config.connectionString)
    .then(db => {

        var express = require('express');
        var app = express();

        var bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        var toolkit = require('mean-toolkit');
        app.use(toolkit.middlewares.enableCors);

        var passport = require('passport');
        app.use(passport.initialize());

        var morgan = require('morgan');
        app.use(morgan('dev'));

        var controllerOptions = { jwt: { secret: config.secret } };
        var AuthenticationController = require('authentication-mod').controllers.AuthenticationController;
        app.use('/authenticate', new AuthenticationController(db, controllerOptions).router);

        var AccountController = require('authentication-mod').controllers.AccountController;
        app.use('/accounts', new AccountController(db, controllerOptions).router);

        var MeController = require('authentication-mod').controllers.MeController;
        app.use('/me', new MeController(db, controllerOptions).router);



        var port = process.env.PORT || 8080;
        app.listen(port);
        console.log('Magic happens at http://localhost:' + port);
    });