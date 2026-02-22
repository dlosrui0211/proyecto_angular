const db = require('../config/db');

// ── ADMIN: Listar todos los pedidos ──────────────────────
exports.getAll = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];

    if (estado) {
      where = 'WHERE p.estado = ?';
      params.push(estado);
    }

    const [rows] = await db.query(
      `SELECT p.id, p.total, p.estado, p.created_at,
              u.id AS usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
              COUNT(pi.id) AS num_items
       FROM pedidos p
       JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM pedidos p ${where}`,
      params
    );

    res.json({ pedidos: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('ERROR getAll pedidos:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN: Detalle de un pedido ──────────────────────────
exports.getById = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email,
              u.telefono AS usuario_telefono, u.direccion AS usuario_direccion
       FROM pedidos p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!pedidos.length) return res.status(404).json({ error: 'Pedido no encontrado' });

    const [items] = await db.query(
      `SELECT pi.*, pr.nombre, pr.imagen, pr.almacenamiento
       FROM pedido_items pi
       JOIN productos pr ON pi.producto_id = pr.id
       WHERE pi.pedido_id = ?`,
      [req.params.id]
    );

    res.json({ ...pedidos[0], items });
  } catch (err) {
    console.error('ERROR getById pedido:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN: Actualizar estado de un pedido ────────────────
exports.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const validos = ['pendiente', 'completado', 'cancelado'];

    if (!validos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Usa: ${validos.join(', ')}` });
    }

    const [result] = await db.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Devolver pedido actualizado
    const [pedidos] = await db.query(
      `SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
       FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    res.json(pedidos[0]);
  } catch (err) {
    console.error('ERROR updateEstado pedido:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN: Eliminar un pedido ────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido eliminado' });
  } catch (err) {
    console.error('ERROR eliminar pedido:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── AUTH: Crear pedido (desde pago) ──────────────────────
exports.crear = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { items } = req.body;
    // items: [{ producto_id, cantidad, precio }]

    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const [pedido] = await conn.query(
      'INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, ?)',
      [req.usuario.id, total, 'pendiente']
    );

    const pedidoId = pedido.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, item.precio]
      );
    }

    await conn.commit();
    res.status(201).json({ id: pedidoId, total, estado: 'pendiente' });
  } catch (err) {
    await conn.rollback();
    console.error('ERROR crear pedido:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ── AUTH: Mis pedidos (usuario autenticado) ──────────────
exports.misPedidos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [pedidos] = await db.query(
      `SELECT p.id, p.total, p.estado, p.created_at,
              COUNT(pi.id) AS num_items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.usuario_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.usuario.id, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM pedidos WHERE usuario_id = ?',
      [req.usuario.id]
    );

    res.json({ pedidos, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('ERROR misPedidos:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── AUTH: Detalle de un pedido propio ─────────────────────
exports.miPedidoDetalle = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.* FROM pedidos p WHERE p.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.usuario.id]
    );

    if (!pedidos.length) return res.status(404).json({ error: 'Pedido no encontrado' });

    const [items] = await db.query(
      `SELECT pi.*, pr.nombre, pr.imagen, pr.almacenamiento
       FROM pedido_items pi
       JOIN productos pr ON pi.producto_id = pr.id
       WHERE pi.pedido_id = ?`,
      [req.params.id]
    );

    res.json({ ...pedidos[0], items });
  } catch (err) {
    console.error('ERROR miPedidoDetalle:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN: Stats rápidas ─────────────────────────────────
exports.getStats = async (_req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total_pedidos,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS completados,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) AS cancelados,
        COALESCE(SUM(total), 0) AS ingresos_totales
      FROM pedidos
    `);
    res.json(stats);
  } catch (err) {
    console.error('ERROR getStats:', err);
    res.status(500).json({ error: err.message });
  }
};
