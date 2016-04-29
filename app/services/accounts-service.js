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
        request.insert(map.identity.userProfile, profile)
          .then(profileResult => {
            info.accountId = accountResult._id;
            request.insert(map.identity.userOrganizationInfo, info)
              .then(infoResult => {
                response.locals.data = { account: accountResult, profile: profileResult, info: infoResult };
                next();
              })
              .catch(e => next(e));
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  update(request, response, next) {
    var data = request.body;
    var query = { 'username': data.username };
    request.update(this.collectionName, query, data)
      .then(doc => {
        response.locals.data = doc;
        next();
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
      locked: body.locked,
      confirmed: body.confirmed,
      roles: []
    }
  }
  getUserProfile(body) {
    return {
      accountId: body.accountId,
      name: body.name,
      dob: body.dob,
      gender: body.gender
    };
  }
  getUserOrganizationInfo(body) {
    return {
      accountId: body.accountId,
      nik: body.nik,
      initial: body.initial,
      department: body.department
    };
  }

}