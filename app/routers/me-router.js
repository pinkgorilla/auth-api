var express = require('express');
var router = express.Router();

var MeService = require('../services/me-service');
var service = new MeService();

var jwt = require('mean-toolkit').passport.jwt;

// Middlewares. 
router.use(service.version.bind(service));

router.all('*', jwt.authenticate({ session: false }));
// Routes. 
router.get('/', service.get.bind(service));
router.put('/', service.update.bind(service));

module.exports = router;