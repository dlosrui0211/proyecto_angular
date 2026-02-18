-- ══════════════════════════════════════════════════════════
--  Apple Store - Inicialización de Base de Datos
-- ══════════════════════════════════════════════════════════
USE apple_tienda;

-- ─── Tabla Usuarios ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  rol         ENUM('admin', 'usuario') DEFAULT 'usuario',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Tabla Productos ────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     TEXT,
  precio          DECIMAL(10,2) NOT NULL,
  imagen          VARCHAR(255),
  stock           INT DEFAULT 0,
  almacenamiento  VARCHAR(20),
  color           VARCHAR(50) DEFAULT 'Negro Titanio',
  activo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Tabla Carrito ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrito (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad    INT DEFAULT 1,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_item (usuario_id, producto_id)
);

-- ─── Tabla Pedidos ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  total       DECIMAL(10,2) NOT NULL,
  estado      ENUM('pendiente','completado','cancelado') DEFAULT 'pendiente',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ─── Tabla Pedido Items ─────────────────────────────────
CREATE TABLE IF NOT EXISTS pedido_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id   INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad    INT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id)   REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ══════════════════════════════════════════════════════════
--  DATOS INICIALES
-- ══════════════════════════════════════════════════════════

-- Admin por defecto: admin@apple.com / Admin123!
-- (contraseña hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@apple.com',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin');

-- ─── iPhones ────────────────────────────────────────────
INSERT INTO productos (nombre, descripcion, precio, imagen, stock, almacenamiento, color) VALUES

('iPhone 16 Pro Max',
 'El iPhone más avanzado jamás creado. Chip A18 Pro con GPU de 6 núcleos, cámara Fusion de 48 MP con zoom óptico 5x, pantalla Super Retina XDR ProMotion de 6.9" con 120Hz adaptativo y titanio de grado 5.',
 1299.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch_AV1?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1725381662964',
 50, '256GB', 'Titanio Negro'),

('iPhone 16 Pro',
 'Potencia profesional en tamaño compacto. Chip A18 Pro, cámara Tetraprism con zoom 5x, pantalla ProMotion de 6.3" y Control de Cámara exclusivo para capturar cada momento.',
 1099.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch_AV1?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 40, '128GB', 'Titanio Natural'),

('iPhone 16',
 'Un salto enorme. Chip A18, Dynamic Island, cámara Fusion de 48 MP y el nuevo Control de Cámara. Diseñado para Apple Intelligence.',
 799.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 60, '128GB', 'Negro'),

('iPhone 16 Plus',
 'La pantalla más grande del iPhone estándar. Todo el poder del iPhone 16 en 6.7" con batería de larga duración para el día completo y más.',
 899.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 35, '128GB', 'Ultramarino'),

('iPhone 15',
 'USB-C, chip A16 Bionic, Dynamic Island y cámara principal de 48 MP. La revolución de la conectividad en el iPhone más accesible de la línea avanzada.',
 699.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 45, '128GB', 'Negro'),

('iPhone 15 Plus',
 'Gran pantalla OLED de 6.7", chip A16 Bionic, puerto USB-C y cámara de 48 MP. Rendimiento excepcional en un diseño elegante.',
 799.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 30, '128GB', 'Verde'),

('iPhone SE (3.ª gen)',
 'El iPhone más asequible con el poderoso chip A15 Bionic, Touch ID y compatibilidad con 5G. Diseño clásico con tecnología moderna.',
 429.99,
 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-finish-select-202203?wid=5120&hei=2880&fmt=p-jpg&qlt=80',
 70, '64GB', 'Blanco estrella');
