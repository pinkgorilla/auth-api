'use strict'

var Service = require('./service');
var Account = require('capital-models').identity.Account;
var map = require('capital-models').map;
var jwt = require('jsonwebtoken');
var config = require('../../config');
var AccountManager = require('../managers/account-manager');

module.exports = class AuthenticationService extends Service {
    constructor() {
        super("1.0.0");
    }

    authenticate(request, response, next) {
        var username = request.body.username;
        var password = request.body.password;
        var query = { username: username };
        var accountManager = new AccountManager(request.db);
        accountManager.authenticate(username, password)
            .then(result => {

                var tokenOption = {};//{ expiresInMinutes: 1440 };
                var token = jwt.sign(result, config.secret, tokenOption);
                response.locals.data = {
                    token: token,
                    user: result
                }
                next();
            })
            .catch(e => {
                next("Authentication failed. Invalid username or password");
            });
    }
}