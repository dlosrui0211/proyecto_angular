const router = require('express').Router();
const ctrl = require('../Controllers/pedidos.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

// Crear pedido (usuario autenticado)
router.post('/', verificarToken, ctrl.crear);

// Usuario: mis pedidos
router.get('/mis-pedidos', verificarToken, ctrl.misPedidos);
router.get('/mis-pedidos/:id', verificarToken, ctrl.miPedidoDetalle);

// Admin: stats, listar, detalle, actualizar, eliminar
router.get('/stats', verificarToken, soloAdmin, ctrl.getStats);
router.get('/',      verificarToken, soloAdmin, ctrl.getAll);
router.get('/:id',   verificarToken, soloAdmin, ctrl.getById);
router.put('/:id',   verificarToken, soloAdmin, ctrl.updateEstado);
router.delete('/:id', verificarToken, soloAdmin, ctrl.eliminar);

module.exports = router;
