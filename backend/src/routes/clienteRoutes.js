const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente } = require('../controllers/clienteController');

// Rutas base para /api/clientes
router.get('/', obtenerClientes);
router.post('/', crearCliente);

module.exports = router;