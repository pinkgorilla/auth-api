'use strict'
var Base = require('./base');

var user = class User extends Base {
    constructor(source) {
        super('user', '1.0.0');
        this.username;
        this.password;
        this.locked = false;
        this.confirmed = true;
        this.roles=[];

        if (source)
            Object.assign(this, source);
    }
} 

module.exports = user;