const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const path   = require('path');
const fs     = require('fs');

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
  res.json({ token, usuario: { id: rows[0].id, nombre: rows[0].nombre, email: rows[0].email, rol: rows[0].rol } });
};

// ── Perfil ──────────────────────────────────────────────
const PERFIL_FIELDS = 'id, nombre, email, telefono, direccion, foto, rol, created_at';

exports.getPerfil = async (req, res) => {
  const [rows] = await db.query(
    `SELECT ${PERFIL_FIELDS} FROM usuarios WHERE id = ?`,
    [req.usuario.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(rows[0]);
};

exports.updatePerfil = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  try {
    await db.query(
      'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, email, telefono || null, direccion || null, req.usuario.id]
    );
    const [rows] = await db.query(
      `SELECT ${PERFIL_FIELDS} FROM usuarios WHERE id = ?`,
      [req.usuario.id]
    );
    res.json(rows[0]);
  } catch {
    res.status(400).json({ error: 'El email ya está en uso' });
  }
};

exports.uploadFoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
  const fotoUrl = `/uploads/${req.file.filename}`;
  await db.query('UPDATE usuarios SET foto = ? WHERE id = ?', [fotoUrl, req.usuario.id]);
  const [rows] = await db.query(
    `SELECT ${PERFIL_FIELDS} FROM usuarios WHERE id = ?`,
    [req.usuario.id]
  );
  res.json(rows[0]);
};

exports.deleteFoto = async (req, res) => {
  const [rows] = await db.query('SELECT foto FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (rows[0]?.foto) {
    const filePath = path.join(__dirname, '..', rows[0].foto);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await db.query('UPDATE usuarios SET foto = NULL WHERE id = ?', [req.usuario.id]);
  res.json({ mensaje: 'Foto eliminada' });
};

exports.changePassword = async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;
  const [rows] = await db.query('SELECT password FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

  const valido = await bcrypt.compare(passwordActual, rows[0].password);
  if (!valido) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

  const hash = await bcrypt.hash(passwordNueva, 10);
  await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, req.usuario.id]);
  res.json({ mensaje: 'Contraseña actualizada' });
};