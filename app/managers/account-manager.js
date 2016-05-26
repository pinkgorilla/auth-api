'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('mean-toolkit').Manager;
var sha1 = require('sha1');

var Account = require('capital-models').identity.Account;
var UserOrganizationInfo = require('capital-models').identity.UserOrganizationInfo;
var UserProfile = require('capital-models').identity.UserProfile;

module.exports = class AccountManager extends Manager {

    constructor(db) {
        super(db);
    }

    read() {
        return new Promise(function (resolve, reject) {


            var accounts = this.db.collection(map.identity.account);
            var infos = this.db.collection(map.identity.userOrganizationInfo);
            var profiles = this.db.collection(map.identity.userProfile);

            accounts.find().toArray()
                .then(docs => {
                    var promises = [];
                    for (var doc of docs) {
                        promises.push(new Promise((resolve, reject) => {
                            var account = doc;
                            var loadProfile = profiles.dbSingle({ accountId: new ObjectId(account._id) });
                            var loadInfo = infos.dbSingle({ accountId: new ObjectId(account._id) });

                            Promise.all([loadProfile, loadInfo])
                                .then(results => {
                                    resolve(Object.assign({}, results[0], results[1], account));
                                })
                                .catch(e => reject(e))
                        }));
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
        return new Promise((resolve, reject) => {
            var query = { username: username.toLowerCase(), password: sha1(password || '') };


            var accounts = this.db.collection(map.identity.account);
            var infos = this.db.collection(map.identity.userOrganizationInfo);
            var profiles = this.db.collection(map.identity.userProfile);

            accounts.dbSingleOrDefault(map.identity.account, query)
                .then(account => {
                    if (account) {
                        var loadProfile = profiles.dbSingle({ accountId: account._id });
                        var loadInfo = infos.dbSingle({ accountId: account._id });
                        Promise.all([loadProfile, loadInfo])
                            .then(results => {
                                var profile = results[0];
                                var info = results[1];
                                var data = {
                                    id: account._id,
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
        });
    }

    get(username) {
        return new Promise((resolve, reject) => {

            var query = { username: username };

            var accounts = this.db.collection(map.identity.account);
            var infos = this.db.collection(map.identity.userOrganizationInfo);
            var profiles = this.db.collection(map.identity.userProfile);

            accounts.dbSingle(query)
                .then(account => {
                    var loadProfile = infos.dbSingle({ accountId: account._id });
                    var loadInfo = profiles.dbSingle({ accountId: account._id });
                    Promise.all([loadProfile, loadInfo])
                        .then(results => {
                            var data = Object.assign({}, results[1], results[0], account);
                            data.password = '';
                            resolve(data);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        });
    }

    create(body) {
        var data = this._getData(body)
        var account = data.account;
        var profile = data.profile;
        var info = data.info;

        var accounts = this.db.collection(map.identity.account);
        var infos = this.db.collection(map.identity.userOrganizationInfo);
        var profiles = this.db.collection(map.identity.userProfile);

        return new Promise((resolve, reject) => {
            profile.dob = profile.dob ? new Date(profile.dob) : new Date();
            account.username = account.username.toLowerCase()
            account.password = sha1(account.password);
            info.initial = (info.initial || '').toUpperCase();

            account.stamp('actor', 'agent');
            profile.stamp('actor', 'agent');
            info.stamp('actor', 'agent');

            this._ensureIndexes().then(indexResults => {
                accounts.dbInsert(account)
                    .then(accountResult => {
                        profile.accountId = accountResult._id;
                        info.accountId = accountResult._id;

                        var insertProfile = profiles.dbInsert(profile);
                        var insertInfo = infos.dbInsert(info);

                        Promise.all([insertProfile, insertInfo])
                            .then(results => {
                                var data = Object.assign({}, results[1], results[0], accountResult);
                                data._id = accountResult._id;
                                resolve(data);
                            })
                            .catch(e => reject(e))
                    })
                    .catch(e => reject(e));
            });
        });
    }

    update(body) {
        var data = this._getData(body)
        var account = data.account;
        var profile = data.profile;
        var info = data.info;

        var accounts = this.db.collection(map.identity.account);
        var infos = this.db.collection(map.identity.userOrganizationInfo);
        var profiles = this.db.collection(map.identity.userProfile);

        var query = { 'username': account.username.toLowerCase() };
        if (account.password && account.password.length > 0)
            account.password = sha1(account.password);

        return new Promise((resolve, reject) => {

            accounts.dbUpdate(query, account, true)
                .then(accountResult => {
                    var updateProfile = new Promise(function (resolve, reject) { resolve(null) });
                    var updateInfo = new Promise(function (resolve, reject) { resolve(null) });
                    if (profile && profile.accountId == accountResult._id) {
                        delete (profile._id);
                        profile.accountId = accountResult._id;
                        updateProfile = profiles.dbUpdate({ accountId: accountResult._id }, profile, true)
                    }
                    if (info && info.accountId == accountResult._id) {
                        delete (info._id);
                        info.accountId = accountResult._id;
                        info.initial = (info.initial || '').toUpperCase();
                        updateInfo = infos.dbUpdate({ accountId: accountResult._id }, info, true)
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
        });
    }

    _ensureIndexes() {
        return new Promise((resolve, reject) => {
            // account indexes
            var accountPromise = this.db.collection(map.identity.Account).createIndexes([
                {
                    key: {
                        username: 1
                    },
                    name: "ix_accounts_username",
                    unique: true
                }]);

            // info indexes
            var infoPromise = this.db.collection(map.identity.userOrganizationInfo).createIndexes([
                {
                    key: {
                        username: 1
                    },
                    name: "ix_user-organization-info_accountId",
                    unique: true
                }]);

            // profile indexes
            var profilePromise = this.db.collection(map.identity.userProfile).createIndexes([
                {
                    key: {
                        username: 1
                    },
                    name: "ix_user-profile_accountId",
                    unique: true
                }]);

            Promise.all([accountPromise, infoPromise, profilePromise])
                .then(results => resolve(null))
                .catch(e => {
                    reject(e);
                });
        })
    }



    _getData(body) {
        var data = {
            account: new Account(body),
            profile: new UserProfile(body),
            info: new UserOrganizationInfo(body)
        };

        return data;
    }
}