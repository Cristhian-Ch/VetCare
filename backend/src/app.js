const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Importar controladores y middlewares personalizados
const paymentController = require('./pagos/payment-controller'); // MODULO DE PAGOS
const notificationController = require('./notificaciones/notification-controller'); // MODULO NOTIFICACIONES
const authController = require('./autenticacion/auth-controller'); // NUEVO MODULO AUTENTICACIÓN
const petController = require('./gestion-mascotas/pet-controller'); // NUEVO MODULO DE MASCOTAS
const appointmentController = require('./gestion-citas/appointment-controller');
const clientController = require('./gestion-clientes/client-controller'); // NUEVO MODULO DE CLIENTES
const { verificarToken } = require('./middlewares/auth-middleware');
const { validarCreacionCita } = require('./middlewares/validation-middleware');


// Endpoint público de prueba de salud
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ==========================================
// ENDPOINTS DEL MÓDULO DE GESTIÓN DE CITAS
// ==========================================
app.post('/api/v1/citas', verificarToken, validarCreacionCita, (req, res) => appointmentController.crearCita(req, res));
app.get('/api/v1/citas', verificarToken, (req, res) => appointmentController.obtenerCitas(req, res));
app.put('/api/v1/citas/:id', verificarToken, (req, res) => appointmentController.actualizarCita(req, res));
app.delete('/api/v1/citas/:id', verificarToken, (req, res) => appointmentController.eliminarCita(req, res));

// ==========================================
// ENDPOINTS DEL MÓDULO DE CLIENTES (NUEVO)
// ==========================================
app.post('/api/v1/clientes', verificarToken, (req, res) => clientController.crearCliente(req, res));
app.get('/api/v1/clientes', verificarToken, (req, res) => clientController.obtenerClientes(req, res));

// ==========================================
// ENDPOINTS DEL MÓDULO DE CLIENTES
// ==========================================
app.post('/api/v1/clientes', verificarToken, (req, res) => clientController.crearCliente(req, res));
app.get('/api/v1/clientes', verificarToken, (req, res) => clientController.obtenerClientes(req, res));
app.put('/api/v1/clientes/:id', verificarToken, (req, res) => clientController.actualizarCliente(req, res)); // NUEVA
app.delete('/api/v1/clientes/:id', verificarToken, (req, res) => clientController.eliminarCliente(req, res)); // NUEVA

// ==========================================
// ENDPOINTS DEL MÓDULO DE MASCOTAS 
// ==========================================
app.post('/api/v1/mascotas', verificarToken, (req, res) => petController.crearMascota(req, res));
app.get('/api/v1/mascotas', verificarToken, (req, res) => petController.obtenerMascotas(req, res));
app.put('/api/v1/mascotas/:id', verificarToken, (req, res) => petController.actualizarMascota(req, res));
app.delete('/api/v1/mascotas/:id', verificarToken, (req, res) => petController.eliminarMascota(req, res));

// ==========================================
// ENDPOINTS DE AUTENTICACIÓN (Públicos)
// ==========================================
app.post('/api/v1/auth/registro', (req, res) => authController.registrar(req, res));
app.post('/api/v1/auth/login', (req, res) => authController.login(req, res));

// ==========================================
// ENDPOINTS DE NOTIFICACIONES
// ==========================================
// Protegemos la ruta porque contiene datos personales de los clientes
app.get('/api/v1/notificaciones/recordatorios-hoy', verificarToken, (req, res) => notificationController.obtenerRecordatorios(req, res));

// ==========================================
// ENDPOINTS DE PAGOS
// ==========================================
app.post('/api/v1/pagos', verificarToken, (req, res) => paymentController.registrarPago(req, res));
app.get('/api/v1/pagos', verificarToken, (req, res) => paymentController.obtenerPagos(req, res));

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo y escuchando en el puerto ${PORT}`);
});

module.exports = app;