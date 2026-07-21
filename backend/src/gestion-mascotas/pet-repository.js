const pool = require('../database');
const crypto = require('crypto');

class PetRepository {
    async guardar(datosMascota) {
        const mascotaId = crypto.randomUUID();
        
        const query = `
            INSERT INTO t_mascota (mascota_id, cliente_id, nombre, especie, raza, edad) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            mascotaId,
            datosMascota.clienteId,
            datosMascota.nombre,
            datosMascota.especie,
            datosMascota.raza,
            datosMascota.edad
        ];
        
        await pool.execute(query, valores);
        
        return {
            mascotaId,
            ...datosMascota,
            estado: 'creada'
        };
    }

    async listarTodos() {
        const query = `SELECT * FROM t_mascota ORDER BY nombre ASC`;
        const [filas] = await pool.execute(query);
        return filas;
    }

    async actualizar(mascotaId, datosMascota) {
        const query = `
            UPDATE t_mascota 
            SET cliente_id = ?, nombre = ?, especie = ?, raza = ?, edad = ? 
            WHERE mascota_id = ?
        `;
        
        const valores = [
            datosMascota.clienteId,
            datosMascota.nombre,
            datosMascota.especie,
            datosMascota.raza,
            datosMascota.edad,
            mascotaId
        ];
        
        const [resultado] = await pool.execute(query, valores);
        
        if (resultado.affectedRows === 0) return null; 
        
        return {
            mascotaId,
            ...datosMascota,
            estado: 'actualizada'
        };
    }

    async eliminar(mascotaId) {
        const query = `DELETE FROM t_mascota WHERE mascota_id = ?`;
        const [resultado] = await pool.execute(query, [mascotaId]);
        return resultado.affectedRows > 0;
    }
}

module.exports = new PetRepository();