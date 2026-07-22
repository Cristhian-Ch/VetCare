const pool = require('../database');
const { v4: uuidv4 } = require('uuid');

class HistorialRepository {
    async registrarHistorial(mascotaId, citaId, peso, temperatura, diagnostico, tratamiento) {
        const historialId = uuidv4();
        const query = `
            INSERT INTO t_historial (historial_id, mascota_id, cita_id, peso, temperatura, diagnostico, tratamiento)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Si no hay citaId, enviamos null
        await pool.execute(query, [historialId, mascotaId, citaId || null, peso, temperatura, diagnostico, tratamiento]);
        
        return { historialId, mascotaId, citaId, peso, temperatura, diagnostico, tratamiento };
    }

    async obtenerHistorialPorMascota(mascotaId) {
        // Usamos LEFT JOIN para traer el motivo de la cita (si es que existe una cita asociada)
        const query = `
            SELECT 
                h.historial_id, 
                h.peso, 
                h.temperatura, 
                h.diagnostico, 
                h.tratamiento, 
                h.fecha_registro,
                c.motivo AS motivo_cita
            FROM t_historial h
            LEFT JOIN t_cita c ON h.cita_id = c.cita_id
            WHERE h.mascota_id = ?
            ORDER BY h.fecha_registro DESC
        `;
        const [filas] = await pool.execute(query, [mascotaId]);
        return filas;
    }
}

module.exports = new HistorialRepository();