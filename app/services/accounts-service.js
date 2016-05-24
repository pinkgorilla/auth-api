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
    
    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.create(request.body)
          .then(result => {
            response.locals.data = result;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  update(request, response, next) { 

    this.connectDb(config.connectionString)
      .then(db => {
        var accountManager = new AccountManager(db);
        accountManager.update(request.body)
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
}