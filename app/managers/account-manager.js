'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('./manager');
var sha1 = require('sha1');

module.exports = class AccountManager extends Manager {

    constructor(db) {
        super(db);
    }

    read() {
        return new Promise(function (resolve, reject) {

            var collection = this.db.collection(map.identity.account);
            collection.find().toArray()
                .then(docs => {
                    var promises = [];
                    for (var doc of docs) {
                        promises.push(new Promise(function (resolve, reject) {
                            var account = doc;
                            var loadProfile = this.dbSingle(map.identity.userProfile, { accountId: new ObjectId(account._id) });
                            var loadInfo = this.dbSingle(map.identity.userOrganizationInfo, { accountId: new ObjectId(account._id) });

                            Promise.all([loadProfile, loadInfo])
                                .then(results => {
                                    resolve(Object.assign({}, results[0], results[1], account));
                                })
                                .catch(e => reject(e))
                        }.bind(this)));
                    }

                    Promise.all(promises)
                        .then(results => {
                            resolve(results);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));

        }.bind(this));
    }

    authenticate(username, password) {
        return new Promise(function (resolve, reject) {
            var query = { username: username.toLowerCase(), password: sha1(password || '') };
            // var query = { username: username };

            this.dbSingleOrDefault(map.identity.account, query)
                .then(account => {
                    if (account) {
                        var loadProfile = this.dbSingle(map.identity.userProfile, { accountId: account._id });
                        var loadInfo = this.dbSingle(map.identity.userOrganizationInfo, { accountId: account._id });
                        Promise.all([loadProfile, loadInfo])
                            .then(results => {
                                var profile = results[0];
                                var info = results[1];
                                var data = {
                                    id:account._id,
                                    username: account.username,
                                    name: profile.name,
                                    nik: info.nik,
                                    initial: info.initial,
                                    department: info.department
                                }; 
                                resolve(data);
                            })
                            .catch(e => reject(e));
                    }
                    else
                        reject("invalid username or password");
                })
                .catch(e => {
                    reject(e);
                });
        }.bind(this));
    }

    get(username) {
        return new Promise(function (resolve, reject) {

            var query = { username: username };

            this.dbSingle(map.identity.account, query)
                .then(account => {
                    var loadProfile = this.dbSingle(map.identity.userProfile, { accountId: account._id });
                    var loadInfo = this.dbSingle(map.identity.userOrganizationInfo, { accountId: account._id });
                    Promise.all([loadProfile, loadInfo])
                        .then(results => {
                            var data = Object.assign({}, results[1], results[0], account);
                            data.password = '';
                            resolve(data);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    create(account, profile, info) {
        return new Promise(function (resolve, reject) {
            profile.dob = profile.dob ? new Date(profile.dob) : new Date();
            account.username = account.username.toLowerCase()
            account.password = sha1(account.password);
            info.initial = (info.initial || '').toUpperCase();
            account.stamp('actor', 'agent');
            profile.stamp('actor', 'agent');
            info.stamp('actor', 'agent');
            this.dbInsert(map.identity.account, account, { username: 1 })
                .then(accountResult => {
                    profile.accountId = accountResult._id;
                    info.accountId = accountResult._id;

                    var insertProfile = this.dbInsert(map.identity.userProfile, profile, { accountId: 1 });
                    var insertInfo = this.dbInsert(map.identity.userOrganizationInfo, info, { accountId: 1 });

                    Promise.all([insertProfile, insertInfo])
                        .then(results => {
                            var data = Object.assign({}, results[1], results[0], accountResult);
                            data._id = accountResult._id;
                            resolve(data);
                        })
                        .catch(e => reject(e))
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    update(account, profile, info) {

        var query = { 'username': account.username };
        if (account.password && account.password.length > 0)
            account.password = sha1(account.password);

        return new Promise(function (resolve, reject) {

            this.dbUpdate(map.identity.account, query, account, true)
                .then(accountResult => {
                    var updateProfile = new Promise(function (resolve, reject) { resolve(null) });
                    var updateInfo = new Promise(function (resolve, reject) { resolve(null) });
                    if (profile && profile.accountId == accountResult._id) {
                        delete (profile._id);
                        profile.accountId = accountResult._id;
                        updateProfile = this.dbUpdate(map.identity.userProfile, { accountId: accountResult._id }, profile, true)
                    }
                    if (info && info.accountId == accountResult._id) {
                        delete (info._id);
                        info.accountId = accountResult._id;
                        info.initial = (info.initial || '').toUpperCase();
                        updateInfo = this.dbUpdate(map.identity.userOrganizationInfo, { accountId: accountResult._id }, info, true)
                    }

                    Promise.all([updateProfile, updateInfo])
                        .then(results => {
                            var data = Object.assign({}, results[1], results[0], accountResult);
                            data._id = accountResult._id;
                            resolve(data);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }.bind(this));
    }
}