var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var morgan = require('morgan');
var mongodb = require('mongodb');
var mongoclient = mongodb.MongoClient;

var config = require('./config');
var port = process.env.PORT || 8080;

mongoclient.connect(config.connectionString, function (error, db) {
    if (error)
        console.log(error);
    else {

        var accountsrouter = require('./app/routers/accounts-router');
        var authenticationrouter = require('./app/routers/authentication-router');
        var cors = require('./app/middlewares/cors');
        var dbwrapper = require('./app/middlewares/db-wrapper');

        app.use(bodyparser.urlencoded({ extended: false }));
        app.use(bodyparser.json());
        app.use(morgan('dev'));
        app.use(cors);
        app.use(dbwrapper(db));

        app.get('/', function (req, res) {
            res.send('Hello! The API is at http://localhost:' + port + '/api');
        });
        app.get('/config', function (req, res) {
            res.json(config);
        });
        app.use('/authenticate', authenticationrouter);

        app.use('/accounts', accountsrouter);

        app.use(function (request, response, next) {
            var apiVersion = response.locals.apiVersion;
            var data = response.locals.data;
            response.json({
                'apiVersion': apiVersion,
                'data': data
            });
        });
        
        app.use(function (error, request, response, next) {
            var apiVersion = response.locals.apiVersion;
            var data = response.locals.data;
            console.log(error);
            response.json({
                'apiVersion': apiVersion,
                'error': {
                    message: error.message
                }
            });
        });

        app.listen(port);
        console.log('Magic happens at http://localhost:' + port);
    }
});