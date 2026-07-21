const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Importar controladores y middlewares personalizados
const appointmentController = require('./gestion-citas/appointment-controller');
const { verificarToken } = require('./middlewares/auth-middleware');
const { validarCreacionCita } = require('./middlewares/validation-middleware'); // El nuevo validador

// Endpoint público de prueba de salud
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Endpoints del módulo de Gestión de Citas
// La ruta POST ahora tiene 2 filtros: 1° verifica quién eres, 2° verifica qué datos traes
app.post('/api/v1/citas', verificarToken, validarCreacionCita, (req, res) => appointmentController.crearCita(req, res));

// La ruta GET sigue protegida solo por el token
app.get('/api/v1/citas', verificarToken, (req, res) => appointmentController.obtenerCitas(req, res));

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo y escuchando en el puerto ${PORT}`);
});

module.exports = app;