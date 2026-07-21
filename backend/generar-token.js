const jwt = require('jsonwebtoken');
require('dotenv').config();

// Creamos la "credencial" con tus datos simulando que ya iniciaste sesión
const payload = {
    idUsuario: 'U-001',
    nombre: 'Cristhian',
    rol: 'admin'
};

// Firmamos el token con la llave secreta de tu archivo .env
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log("\n Aquí tienes tu token de acceso (válido por 1 hora):\n");
console.log(token);
console.log("\n");