const router = require('express').Router();
const ctrl   = require('../Controllers/productos.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    verificarToken, soloAdmin, ctrl.create);
router.put('/:id',  verificarToken, soloAdmin, ctrl.update);
router.delete('/:id', verificarToken, soloAdmin, ctrl.eliminar);
module.exports = router;