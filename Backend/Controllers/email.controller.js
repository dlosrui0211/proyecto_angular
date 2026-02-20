const nodemailer = require('nodemailer');
const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (!rows.length) {
      return res.json({ mensaje: 'Si el email existe, recibirás un enlace.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000);

    await db.query(
      'UPDATE usuarios SET reset_token = ?, reset_expira = ? WHERE email = ?',
      [token, expira, email]
    );

    const enlace = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Apple Tienda" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recupera tu contraseña - Apple Tienda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; color: #1d1d1f; text-align: center;">Recupera tu contraseña</h1>
          <p style="color: #6e6e73; font-size: 16px; text-align: center; margin: 16px 0 32px;">Haz clic en el botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
          <div style="text-align: center;">
            <a href="${enlace}" style="background: #0071e3; color: white; padding: 14px 32px; border-radius: 980px; text-decoration: none; font-size: 17px; font-weight: 500;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #aeaeb2; font-size: 13px; text-align: center; margin-top: 32px;">Si no solicitaste esto, ignora este email.</p>
        </div>
      `
    });

    console.log('Email enviado a:', email);
    res.json({ mensaje: 'Si el email existe, recibirás un enlace.' });

  } catch (err) {
    console.error('ERROR EMAIL:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const [rows] = await db.query(
    'SELECT * FROM usuarios WHERE reset_token = ? AND reset_expira > NOW()',
    [token]
  );

  if (!rows.length) return res.status(400).json({ error: 'Token inválido o expirado' });

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'UPDATE usuarios SET password = ?, reset_token = NULL, reset_expira = NULL WHERE id = ?',
    [hash, rows[0].id]
  );

  res.json({ mensaje: 'Contraseña actualizada correctamente' });
};