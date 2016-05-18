var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('../../config');

var authService = new (require('../services/authentication-service'))(); 
var passportLocal = require('mean-toolkit').passport.local;

passportLocal.strategy(function (username, password, done) {
    authService.authenticate(username, password)
        .then(user => {
            done(null, user);
        })
        .catch(e => {
            done(null, false);
        });
});

// Middlewares. 
router.use(authService.version.bind(authService));

// Routes. 
router.post('/', passportLocal.authenticate({ session: false }), function (request, response, next) {
    var user = request.user;
    var tokenOption = { expiresIn: 1440 };

    var token = jwt.sign(user, config.secret, tokenOption);
    response.locals.data = {
        token: token,
        user: user
    }
    next();
});

module.exports = router;