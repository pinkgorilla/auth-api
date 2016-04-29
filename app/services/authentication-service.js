'use strict'

var Service = require('./service');
var Account = require('capital-models').identity.Account;
var jwt = require('jsonwebtoken');
var config = require('../../config');

module.exports = class AuthenticationService extends Service {
    constructor() {
        super("1.0.0");
        this.collectionName = "accounts";
    }

    authenticate(request, response, next) {
        var username = request.body.username;
        var query = { username: username };

        request.single(this.collectionName, query)
            .then(account => {
                if (!account)
                    reponse.locals.data = { success: false, message: "Authentication failed. Account not found" };
                else if (account) {
                    if (account.password != request.body.password)
                        reponse.locals.data = { success: false, message: "Authentication failed. Invalid username or password" };
                    else {
                        var tokenOption = {};//{ expiresInMinutes: 1440 };
                        var token = jwt.sign(account, config.secret, tokenOption);
                        response.locals.data = { success: true, token: token }

                    }
                }
                next();
            })
            .catch(e => next(e));
    }
}