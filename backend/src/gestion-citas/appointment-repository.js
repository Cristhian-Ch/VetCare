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
}

module.exports = new AppointmentRepository();