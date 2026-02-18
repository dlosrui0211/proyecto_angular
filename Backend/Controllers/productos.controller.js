const db = require('../config/db');

exports.getAll    = async (req, res) => { const [r] = await db.query('SELECT * FROM productos WHERE activo=1'); res.json(r); };
exports.getById   = async (req, res) => { const [r] = await db.query('SELECT * FROM productos WHERE id=?', [req.params.id]); res.json(r[0]); };
exports.create    = async (req, res) => { const { nombre,descripcion,precio,imagen,stock,almacenamiento,color } = req.body; await db.query('INSERT INTO productos (nombre,descripcion,precio,imagen,stock,almacenamiento,color) VALUES (?,?,?,?,?,?,?)',[nombre,descripcion,precio,imagen,stock,almacenamiento,color]); res.json({ mensaje:'Producto creado' }); };
exports.update    = async (req, res) => { const { nombre,descripcion,precio,imagen,stock,almacenamiento,color } = req.body; await db.query('UPDATE productos SET nombre=?,descripcion=?,precio=?,imagen=?,stock=?,almacenamiento=?,color=? WHERE id=?',[nombre,descripcion,precio,imagen,stock,almacenamiento,color,req.params.id]); res.json({ mensaje:'Actualizado' }); };
exports.eliminar  = async (req, res) => { await db.query('UPDATE productos SET activo=0 WHERE id=?',[req.params.id]); res.json({ mensaje:'Eliminado' }); };