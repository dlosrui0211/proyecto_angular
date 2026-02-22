const db = require('../config/db');

exports.getCarrito = async (req, res) => {
  const [r] = await db.query(
    `SELECT c.id, c.producto_id, p.nombre, p.precio, p.imagen, p.almacenamiento, c.cantidad
     FROM carrito c JOIN productos p ON c.producto_id = p.id
     WHERE c.usuario_id = ?`, [req.usuario.id]);
  res.json(r);
};

exports.agregar = async (req, res) => {
  const { producto_id, cantidad = 1 } = req.body;
  const [ex] = await db.query('SELECT * FROM carrito WHERE usuario_id=? AND producto_id=?', [req.usuario.id, producto_id]);
  if (ex.length) {
    await db.query('UPDATE carrito SET cantidad=cantidad+? WHERE usuario_id=? AND producto_id=?', [cantidad, req.usuario.id, producto_id]);
  } else {
    await db.query('INSERT INTO carrito (usuario_id,producto_id,cantidad) VALUES (?,?,?)', [req.usuario.id, producto_id, cantidad]);
  }
  res.json({ mensaje: 'Agregado' });
};

exports.eliminar = async (req, res) => {
  await db.query('DELETE FROM carrito WHERE id=? AND usuario_id=?', [req.params.id, req.usuario.id]);
  res.json({ mensaje: 'Eliminado' });
};

exports.vaciar = async (req, res) => {
  await db.query('DELETE FROM carrito WHERE usuario_id=?', [req.usuario.id]);
  res.json({ mensaje: 'Carrito vaciado' });
};