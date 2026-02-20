const router = require('express').Router();
const ctrl = require('../Controllers/email.controller');

router.post('/recuperar', ctrl.solicitarRecuperacion);
router.post('/reset', ctrl.resetPassword);

module.exports = router;