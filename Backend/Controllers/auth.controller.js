const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );
    res.json({ mensaje: 'Usuario registrado' });
  } catch {
    res.status(400).json({ error: 'El email ya está en uso' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  if (!rows.length) return res.status(400).json({ error: 'Credenciales inválidas' });

  const valido = await bcrypt.compare(password, rows[0].password);
  if (!valido) return res.status(400).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: rows[0].id, email: rows[0].email, rol: rows[0].rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, usuario: { id: rows[0].id, nombre: rows[0].nombre, rol: rows[0].rol } });
};