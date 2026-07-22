const pool = require('../database');

class NotificationRepository {
    async obtenerRecordatoriosDeHoy() {
        // Unimos las 3 tablas y filtramos para que solo traiga las citas del día actual
        const query = `
            SELECT 
                c.cita_id, 
                c.fecha, 
                c.motivo,
                cl.nombre AS cliente_nombre, 
                cl.telefono, 
                m.nombre AS mascota_nombre
            FROM t_cita c
            INNER JOIN t_cliente cl ON c.cliente_id = cl.cliente_id
            INNER JOIN t_mascota m ON c.mascota_id = m.mascota_id
            WHERE DATE(c.fecha) = CURDATE()
        `;
        
        const [filas] = await pool.execute(query);
        return filas;
    }
}

module.exports = new NotificationRepository();