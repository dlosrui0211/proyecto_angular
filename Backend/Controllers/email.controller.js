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

exports.confirmarPedido = async (req, res) => {
  try {
    const { email, nombre, items, total } = req.body;

    const itemsHtml = items.map(i => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #1d1d1f;">${i.nombre}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #6e6e73; text-align: center;">x${i.cantidad}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #1d1d1f; text-align: right;">${(i.precio * i.cantidad).toFixed(2)}€</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"Apple Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirmación de pedido - Apple Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #1d1d1f;">Apple Store</h1>
          </div>
          <h2 style="font-size: 22px; color: #1d1d1f;">¡Gracias por tu pedido, ${nombre}!</h2>
          <p style="color: #6e6e73; font-size: 16px; margin: 12px 0 32px;">Tu pedido ha sido confirmado y está siendo procesado.</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 12px 0; border-bottom: 2px solid #1d1d1f; color: #1d1d1f;">Producto</th>
                <th style="text-align: center; padding: 12px 0; border-bottom: 2px solid #1d1d1f; color: #1d1d1f;">Cantidad</th>
                <th style="text-align: right; padding: 12px 0; border-bottom: 2px solid #1d1d1f; color: #1d1d1f;">Precio</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="margin-top: 24px; text-align: right;">
            <p style="font-size: 20px; font-weight: 700; color: #1d1d1f;">Total: ${total}€</p>
          </div>

          <div style="margin-top: 32px; padding: 20px; background: #f5f5f7; border-radius: 12px;">
            <p style="color: #6e6e73; font-size: 14px; margin: 0;">Este es un pedido simulado. No se ha realizado ningún cargo real.</p>
          </div>

          <p style="color: #aeaeb2; font-size: 13px; text-align: center; margin-top: 32px;">© Apple Store 2024</p>
        </div>
      `
    });

    res.json({ mensaje: 'Email de confirmación enviado' });
  } catch (err) {
    console.error('ERROR CONFIRMAR PEDIDO:', err);
    res.status(500).json({ error: err.message });
  }
};