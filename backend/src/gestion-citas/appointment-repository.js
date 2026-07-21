const pool = require('../database');
const crypto = require('crypto');

class AppointmentRepository {
    async guardar(datosCita) {
        const citaId = crypto.randomUUID(); 
        
        const query = `
            INSERT INTO t_cita (cita_id, cliente_id, mascota_id, fecha, hora, motivo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            citaId, 
            datosCita.clienteId, 
            datosCita.mascotaId, 
            datosCita.fecha, 
            datosCita.hora, 
            datosCita.motivo
        ];
        
        await pool.execute(query, valores);
        
        return {
            citald: citaId,
            estado: 'creada',
            mascotaId: datosCita.mascotaId,
            fecha: datosCita.fecha,
            hora: datosCita.hora
        };
    }

    async listarTodos() {
        const query = `SELECT * FROM t_cita ORDER BY fecha DESC, hora DESC`;
        const [filas] = await pool.execute(query);
        return filas;
    }

    async actualizar(citaId, datosCita) {
        const query = `
            UPDATE t_cita 
            SET fecha = ?, hora = ?, motivo = ? 
            WHERE cita_id = ?
        `;
        
        const valores = [
            datosCita.fecha,
            datosCita.hora,
            datosCita.motivo,
            citaId
        ];
        
        const [resultado] = await pool.execute(query, valores);
        
        if (resultado.affectedRows === 0) {
            return null; 
        }
        
        return {
            citaId: citaId,
            estado: 'actualizada',
            fecha: datosCita.fecha,
            hora: datosCita.hora,
            motivo: datosCita.motivo
        };
    }

    // NUEVO MÉTODO: Eliminar cita de la base de datos
    async eliminar(citaId) {
        const query = `DELETE FROM t_cita WHERE cita_id = ?`;
        const [resultado] = await pool.execute(query, [citaId]);
        
        // Si affectedRows es 0, significa que el ID no existía
        if (resultado.affectedRows === 0) {
            return false;
        }
        
        return true;
    }
}

module.exports = new AppointmentRepository();