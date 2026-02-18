const router = require('express').Router();
const ctrl   = require('../Controllers/carrito.controller');
const { verificarToken } = require('../middleware/auth.middleware');
router.get('/',        verificarToken, ctrl.getCarrito);
router.post('/',       verificarToken, ctrl.agregar);
router.delete('/:id',  verificarToken, ctrl.eliminar);
router.delete('/',     verificarToken, ctrl.vaciar);
module.exports = router;