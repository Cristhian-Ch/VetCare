const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base de prueba (Healthcheck)
app.get('/api/v1/health', (req, res) => {
    res.json({ estado: 'ok', mensaje: 'Servidor VetCare (Monolito Modular) en ejecución' });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de VetCare corriendo en http://localhost:${PORT}`);
});