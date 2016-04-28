var Service = require('../services/users-service'); 
var express = require('express');
var router = express.Router();
var service = new Service();

// Middlewares. 
router.use(service.version.bind(service));

// Routes.
router.get('/', service.all.bind(service));
router.get('/:username', service.get.bind(service));
router.post('/', service.create.bind(service));
router.put('/:username', service.update.bind(service));
router.delete('/:username', service.delete.bind(service));

module.exports = router;