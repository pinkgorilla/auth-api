'use strict'

module.exports = class Manager {
    constructor(db) {
        this.db = db;
    }

    dbSingle(collectionName, query) {
        return new Promise(function(resolve, reject){        
            this.db.collection(collectionName).find(query).limit(1).next()
            .then(data=> {
                if(!data)
                    reject('data not found');
                resolve(data);
            })  
            .catch(e=> reject(e));  
        }.bind(this));  
    }

    dbInsert(collectionName, newData) {
        return new Promise(function (resolve, reject) {
            var collection = this.db.collection(collectionName);
            collection
                .insertOne(newData)
                .then(result => {
                    var id = result.insertedId;
                    this.dbSingle(collectionName, { _id: id })
                        .then(data => {
                            resolve(data);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    dbUpdate(collectionName, query, updateObject, skipStampCheck) {

        return new Promise(function (resolve, reject) {

            this.dbSingle(collectionName, query)
                .then(doc => {
                    if (!skipStampCheck && doc._stamp != updateObject._stamp)
                        reject('stamp mismatch');
                    else {
                        var Base = require('capital-models').Base;

                        if (updateObject instanceof Base) {
                            updateObject.stamp('', '');
                        }

                        var collection = this.db.collection(collectionName);
                        delete updateObject._id;
                        collection.updateOne(query, { $set: updateObject })
                            .then(result => {
                                this.dbSingle(collectionName, query)
                                    .then(redoc => {
                                        resolve(redoc);
                                    })
                                    .catch(e => reject(e));
                            })
                            .catch(e => reject(e));
                    }
                })
                .catch(e => reject(e));
        }.bind(this));
    }
}