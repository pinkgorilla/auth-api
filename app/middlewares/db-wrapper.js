module.exports = function (db) {
    var dbwrapper = function (request, response, next) {
        var r = request;
        r.db = db;

        // get single data;
        r.single = function (collectionName, query) {
            return r.db.collection(collectionName).find(query).limit(1).next();
        };

        // insert single data
        r.insert = function (collectionName, newData) {

            return new Promise(function (resolve, reject) {
                var collection = r.db.collection(collectionName);
                collection
                    .insertOne(newData)
                    .then(result => {
                        var id = result.insertedId;
                        r.single(collectionName, { _id: id })
                            .then(data => {
                                resolve(data);
                            })
                            .catch(e => reject(e));
                    })
                    .catch(e => reject(e));
            });
        }

        // update single data
        r.update = function (collectionName, query, updateObject, skipStampCheck) {

            return new Promise(function (resolve, reject) {

                r.single(collectionName, query)
                    .then(doc => {
                        if (!skipStampCheck && doc._stamp != updateObject._stamp)
                            reject('stamp mismatch');
                        else {
                            var Base = require('capital-models').Base;

                            if (updateObject instanceof Base) { 
                                updateObject.stamp('', '');
                            }

                            var collection = r.db.collection(collectionName);
                            delete updateObject._id;
                            collection.updateOne(query, { $set: updateObject })
                                .then(result => {
                                    r.single(collectionName, query)
                                        .then(redoc => {
                                            resolve(redoc);
                                        })
                                        .catch(e => reject(e));
                                })
                                .catch(e => reject(e));
                        }
                    })
                    .catch(e => reject(e));
            });
        }
        next();
    }
    return dbwrapper;
}