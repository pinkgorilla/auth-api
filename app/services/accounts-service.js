'use strict'

var Service = require('./service');
var Account = require('capital-models').identity.Account;
var UserProfile = require('capital-models').identity.UserProfile;
var UserOrganizationInfo = require('capital-models').identity.UserOrganizationInfo;
var map = require('capital-models').map;

module.exports = class AccountService extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = "accounts";
  }

  all(request, response, next) {
    var collection = request.db.collection(this.collectionName);
    collection.find().toArray()
      .then(docs => {
        response.locals.data = docs;
        next();
      })
      .catch(e => next(e));
  }

  get(request, response, next) {
    var username = request.params.username;
    var query = { username: username };

    request.single(this.collectionName, query)
      .then(doc => {
        response.locals.data = doc;
        next();
      })
      .catch(e => next(e));
  }

  create(request, response, next) {
    var body = this.getData(request.body);
    var account = Object.assign(new Account(), body.account);
    var profile = Object.assign(new UserProfile(), body.profile);
    var info = Object.assign(new UserOrganizationInfo(), body.info);

    var accountCollection = request.db.collection(map.identity.account);
    profile.dob = profile.dob ? new Date(profile.dob) : new Date();
    account.stamp('actor', 'agent');
    profile.stamp('actor', 'agent');
    info.stamp('actor', 'agent');

    request.insert(map.identity.account, account)
      .then(accountResult => {
        profile.accountId = accountResult._id;
        info.accountId = accountResult._id;

        var insertProfile = request.insert(map.identity.userProfile, profile);
        var insertInfo = request.insert(map.identity.userOrganizationInfo, info);

        Promise.all([insertProfile, insertInfo])
          .then(results => {
            var data = Object.assign({}, results[1], results[0], accountResult);
            data._id = accountResult._id;
            response.locals.data = data;
            next();
          })
          .catch(e => next(e))
      })
      .catch(e => next(e));
  }

  update(request, response, next) {
    var body = this.getData(request.body);
    var account = Object.assign(new Account(), body.account);
    var profile = Object.assign(new UserProfile(), body.profile);
    var info = Object.assign(new UserOrganizationInfo(), body.info);

    var query = { 'username': account.username };
    request.update(map.identity.account, query, account, true)
      .then(accountResult => {
        var updateProfile = new Promise(function (resolve, reject) { resolve(null) });
        var updateInfo = new Promise(function (resolve, reject) { resolve(null) });
        if (profile && profile.accountId == accountResult._id) {
          delete (profile._id);
          profile.accountId = accountResult._id;
          updateProfile = request.update(map.identity.userProfile, { accountId: accountResult._id }, profile, true)
        }
        if (info && info.accountId == accountResult._id) {
          delete (info._id);
          info.accountId = accountResult._id;
          updateInfo = request.update(map.identity.userOrganizationInfo, { accountId: accountResult._id }, info, true)
        }

        Promise.all([updateProfile, updateInfo])
          .then(results => {

            var data = Object.assign({}, results[1], results[0], accountResult);
            data._id = accountResult._id;
            response.locals.data = data;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  delete(request, response, next) {
    console.log('delete:called');
    response.send('');
  }




  ///

  getData(body) {
    var data = {
      account: this.getAccount(body),
      profile: this.getUserProfile(body),
      info: this.getUserOrganizationInfo(body)
    };

    return data;
  }
  getAccount(body) {
    return {
      _id: body._id,
      username: body.username,
      password: body.password,
      email: body.email,
      locked: body.locked,
      confirmed: body.confirmed,
      roles: [],
      _stamp: body._stamp
    }
  }
  getUserProfile(body) {
    return {
      accountId: body._id || body.accountId,
      name: body.name,
      dob: body.dob,
      gender: body.gender
    };
  }
  getUserOrganizationInfo(body) {
    return {
      accountId: body._id || body.accountId,
      nik: body.nik,
      initial: body.initial,
      department: body.department
    };
  }

}