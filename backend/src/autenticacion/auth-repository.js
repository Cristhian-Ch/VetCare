const pool = require('../database');
const crypto = require('crypto');

class AuthRepository {
    async buscarPorCorreo(correo) {
        const query = `SELECT * FROM t_usuario WHERE correo = ?`;
        const [filas] = await pool.execute(query, [correo]);
        return filas[0];
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
            datosUsuario.password,
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

    /* ── Gestión de usuarios ─────────────────────────────────────────────── */

    async obtenerTodos() {
        const query = `
            SELECT usuario_id, nombre, correo, rol, 
                   created_at
            FROM t_usuario
            ORDER BY created_at DESC
        `;
        // created_at puede no existir en tablas antiguas; lo protegemos con COALESCE
        try {
            const [filas] = await pool.execute(query);
            return filas;
        } catch {
            // Si la columna created_at no existe, consulta sin ella
            const fallback = `
                SELECT usuario_id, nombre, correo, rol
                FROM t_usuario
                ORDER BY nombre ASC
            `;
            const [filas] = await pool.execute(fallback);
            return filas;
        }
    }

    async buscarPorId(id) {
        const [filas] = await pool.execute(
            `SELECT usuario_id, nombre, correo, rol FROM t_usuario WHERE usuario_id = ?`,
            [id]
        );
        return filas[0];
    }

    async actualizarUsuario(id, datos) {
        const campos = [];
        const valores = [];

        if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
        if (datos.rol    !== undefined) { campos.push('rol = ?');    valores.push(datos.rol);    }
        if (datos.correo !== undefined) { campos.push('correo = ?'); valores.push(datos.correo); }
        if (datos.password !== undefined) { campos.push('password = ?'); valores.push(datos.password); }

        if (campos.length === 0) return false;

        valores.push(id);
        const query = `UPDATE t_usuario SET ${campos.join(', ')} WHERE usuario_id = ?`;
        await pool.execute(query, valores);
        return true;
    }

    async eliminarUsuario(id) {
        await pool.execute(`DELETE FROM t_usuario WHERE usuario_id = ?`, [id]);
    }
}

module.exports = new AuthRepository();