var express = require('express');
var router = express.Router();

var AccountsService = require('../services/accounts-service'); 
var service = new AccountsService();

var jwt = require('mean-toolkit').passport.jwt; 

// Middlewares. 
router.use(service.version.bind(service));

router.all('*', jwt.authenticate({ session: false }));
// Routes.
router.post('/', service.create.bind(service));
router.get('/', service.all.bind(service));
router.put('/', service.update.bind(service)); 

router.get('/:username', service.get.bind(service));
router.delete('/:username', service.delete.bind(service));

module.exports = router;