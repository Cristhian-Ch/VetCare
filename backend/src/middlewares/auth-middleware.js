const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Extraer el token de las cabeceras (Header: Authorization)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"

    // 2. Si no hay token, rechazamos la petición inmediatamente (401 Unauthorized)
    if (!token) {
        return res.status(401).json({
            codigo: "ERR_UNAUTHORIZED",
            mensaje: "Acceso denegado. Se requiere un token de autenticación."
        });
    }

    try {
        // 3. Verificamos que el token sea válido y no haya sido alterado
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos del usuario en la petición por si el controlador los necesita
        req.usuario = payloadDecodificado;
        
        // 5. El token es válido, dejamos que la petición continúe hacia el controlador
        next();
    } catch (error) {
        // Si el token expiró o es falso (Spoofing)
        return res.status(403).json({
            codigo: "ERR_FORBIDDEN",
            mensaje: "Token inválido o expirado."
        });
    }
};

module.exports = { verificarToken };