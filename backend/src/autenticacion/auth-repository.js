const pool = require('../database');
const crypto = require('crypto');

class AuthRepository {
    async buscarPorCorreo(correo) {
        const query = `SELECT * FROM t_usuario WHERE correo = ?`;
        const [filas] = await pool.execute(query, [correo]);
        return filas[0]; // Retorna el usuario si lo encuentra, o undefined si no existe
    }

    async crearUsuario(datosUsuario) {
        const usuarioId = crypto.randomUUID();
        const query = `
            INSERT INTO t_usuario (usuario_id, nombre, correo, password, rol) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const valores = [
            usuarioId,
            datosUsuario.nombre,
            datosUsuario.correo,
            datosUsuario.password, // La contraseña ya llegará encriptada desde el controlador
            datosUsuario.rol || 'admin'
        ];
        
        await pool.execute(query, valores);
        
        return { 
            usuarioId, 
            nombre: datosUsuario.nombre, 
            correo: datosUsuario.correo, 
            rol: datosUsuario.rol 
        };
    }
}

module.exports = new AuthRepository();