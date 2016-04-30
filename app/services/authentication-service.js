'use strict'

var Service = require('./service');
var Account = require('capital-models').identity.Account;
var map = require('capital-models').map;
var jwt = require('jsonwebtoken');
var config = require('../../config');

module.exports = class AuthenticationService extends Service {
    constructor() {
        super("1.0.0");
    }

    authenticate(request, response, next) {
        var username = request.body.username;
        var query = { username: username };

        request.single(map.identity.account, query)
            .then(account => {
                if (!account) {
                    reponse.locals.data = { success: false, message: "Authentication failed. Account not found" };
                    next();
                }
                else if (account) {
                    if (account.password != request.body.password) {
                        reponse.locals.data = { success: false, message: "Authentication failed. Invalid username or password" };
                        next();
                    }
                    else {
                        var loadProfile = request.single(map.identity.userProfile, { accountId: account._id });
                        var loadInfo = request.single(map.identity.userOrganizationInfo, { accountId: account._id });
                        Promise.all([loadProfile, loadInfo])
                            .then(results => {

                                var tokenOption = {};//{ expiresInMinutes: 1440 };
                                var data = Object.assign({}, results[1], results[0], account);
                                var token = jwt.sign(data, config.secret, tokenOption);
                                response.locals.data = { success: true, token: token }
                                next();
                            })
                            .catch(e => next(e));
                    }
                }
            })
            .catch(e => next(e));
    }
}