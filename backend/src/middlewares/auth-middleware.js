const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            codigo: "ERR_UNAUTHORIZED",
            mensaje: "Acceso denegado. Se requiere un token de autenticación."
        });
    }

    try {
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payloadDecodificado;
        next();
    } catch (error) {
        return res.status(403).json({
            codigo: "ERR_FORBIDDEN",
            mensaje: "Token inválido o expirado."
        });
    }
};

/* Sólo permite el acceso a usuarios con rol 'admin' */
const soloAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({
            codigo: "ERR_FORBIDDEN",
            mensaje: "Acceso restringido: se requiere rol de administrador."
        });
    }
    next();
};

module.exports = { verificarToken, soloAdmin };