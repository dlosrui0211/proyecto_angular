const router = require('express').Router();
const ctrl   = require('../Controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Configurar multer para subida de fotos
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `perfil-${req.usuario.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

router.post('/login',    ctrl.login);
router.post('/register', ctrl.register);

// Perfil (requiere autenticación)
router.get('/perfil',            verificarToken, ctrl.getPerfil);
router.put('/perfil',            verificarToken, ctrl.updatePerfil);
router.put('/perfil/password',   verificarToken, ctrl.changePassword);
router.post('/perfil/foto',      verificarToken, upload.single('foto'), ctrl.uploadFoto);
router.delete('/perfil/foto',    verificarToken, ctrl.deleteFoto);

module.exports = router;