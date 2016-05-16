var Service = require('../services/accounts-service');
var express = require('express');
var router = express.Router();
var jwtauth = require('capital-auth');
var config = require('../../config');
var service = new Service();

// Middlewares. 
router.use(service.version.bind(service));


// Routes.
// router.use(jwtauth.authorize(config.secret));
router.post('/', service.create.bind(service));
router.get('/', service.all.bind(service));
router.get('/:username', service.get.bind(service));
router.put('/:username', service.update.bind(service));
router.delete('/:username', service.delete.bind(service));

module.exports = router;