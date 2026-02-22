const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir fotos de perfil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/carrito',   require('./routes/carrito.routes'));
app.use('/api/pedidos',   require('./routes/pedidos.routes'));
app.use('/api/email', require('./routes/email.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));