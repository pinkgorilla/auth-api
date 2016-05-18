'use strict'

var Service = require('mean-toolkit').Service;
var config = require('../../config');
var AccountManager = require('../managers/account-manager');

module.exports = class AuthenticationService extends Service {
    constructor() {
        super("1.0.0");
    }

    authenticate(username, password) {
        return new Promise(function (resolve, reject) {
            this.connectDb(config.connectionString)
                .then(db => {
                    var accountManager = new AccountManager(db);
                    accountManager.authenticate(username, password)
                        .then(user => {
                            resolve(user);
                        })
                        .catch(e => {
                            reject("Authentication failed. Invalid username or password");
                        });
                })
                .catch(e => {
                    reject(e);
                });
        }.bind(this));
    }
}