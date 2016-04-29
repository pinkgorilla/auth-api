var Service = require('../services/authentication-service');
var express = require('express');
var router = express.Router();
var service = new Service();

// Middlewares. 
router.use(service.version.bind(service));

// Routes. 
router.post('/', service.authenticate.bind(service));

module.exports = router;