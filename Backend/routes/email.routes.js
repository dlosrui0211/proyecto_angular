const router = require('express').Router();
const ctrl = require('../Controllers/email.controller');

router.post('/recuperar', ctrl.solicitarRecuperacion);
router.post('/reset', ctrl.resetPassword);
router.post('/confirmar-pedido', ctrl.confirmarPedido);

module.exports = router;