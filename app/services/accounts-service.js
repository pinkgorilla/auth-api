'use strict'

var Service = require('mean-toolkit').Service;
var Account = require('capital-models').identity.Account;
var UserProfile = require('capital-models').identity.UserProfile;
var UserOrganizationInfo = require('capital-models').identity.UserOrganizationInfo;
var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var AccountManager = require('../managers/account-manager');
var config = require('../../config');

module.exports = class AccountService extends Service {
  constructor() {
    super("1.0.0");
  }

  all(request, response, next) {
    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.read()
          .then(result => {
            response.locals.data = result;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  get(request, response, next) {
    var username = request.params.username;
    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.get(username)
          .then(result => {
            response.locals.data = result;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  create(request, response, next) {
    var body = this.getData(request.body);
    var account = Object.assign(new Account(), body.account);
    var profile = Object.assign(new UserProfile(), body.profile);
    var info = Object.assign(new UserOrganizationInfo(), body.info);

    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.create(account, profile, info)
          .then(result => {
            response.locals.data = result;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  update(request, response, next) {
    var body = this.getData(request.body);
    var account = Object.assign(new Account(), body.account);
    var profile = Object.assign(new UserProfile(), body.profile);
    var info = Object.assign(new UserOrganizationInfo(), body.info);

    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.update(account, profile, info)
          .then(result => {
            response.locals.data = result;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  delete(request, response, next) {
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