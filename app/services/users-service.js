'use strict'

var Service = require('./service');
var User = require('../models/user');

module.exports = class UsersService extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = "users";
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
    var body = request.body;
    var data = Object.assign(new User(), body);
    var collection = request.db.collection(this.collectionName);
    data.dob = data.dob ? new Date(data.dob) : new Date();
    data.stamp('actor', 'agent');

    collection.insertOne(data)
      .then(result => {
        response.locals.data = result;
        next();
      })
      .catch(e => next(e))
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
}