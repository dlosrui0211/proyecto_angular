const router = require('express').Router();
const ctrl   = require('../Controllers/auth.controller');
router.post('/login',    ctrl.login);
router.post('/register', ctrl.register);
module.exports = router;