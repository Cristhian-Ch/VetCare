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
        // Consulta para traer todas las citas ordenadas de la más reciente a la más antigua
        const query = `SELECT * FROM t_cita ORDER BY fecha DESC, hora DESC`;
        
        const [filas] = await pool.execute(query);
        
        return filas;
    }
}

module.exports = new AppointmentRepository();