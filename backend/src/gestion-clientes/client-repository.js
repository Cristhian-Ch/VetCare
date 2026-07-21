const pool = require('../database');
const crypto = require('crypto');

class ClientRepository {
    async guardar(datosCliente) {
        const clienteId = crypto.randomUUID();
        
        const query = `
            INSERT INTO t_cliente (cliente_id, nombre, telefono, correo, direccion) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const valores = [
            clienteId,
            datosCliente.nombre,
            datosCliente.telefono,
            datosCliente.correo,
            datosCliente.direccion
        ];
        
        await pool.execute(query, valores);
        
        return {
            clienteId: clienteId,
            nombre: datosCliente.nombre,
            telefono: datosCliente.telefono,
            correo: datosCliente.correo,
            direccion: datosCliente.direccion,
            estado: 'creado'
        };
    }

    async listarTodos() {
        const query = `SELECT * FROM t_cliente ORDER BY nombre ASC`;
        const [filas] = await pool.execute(query);
        return filas;
    }

    // NUEVO MÉTODO: Actualizar cliente
    async actualizar(clienteId, datosCliente) {
        const query = `
            UPDATE t_cliente 
            SET nombre = ?, telefono = ?, correo = ?, direccion = ? 
            WHERE cliente_id = ?
        `;
        
        const valores = [
            datosCliente.nombre,
            datosCliente.telefono,
            datosCliente.correo,
            datosCliente.direccion,
            clienteId
        ];
        
        const [resultado] = await pool.execute(query, valores);
        
        if (resultado.affectedRows === 0) {
            return null; 
        }
        
        return {
            clienteId: clienteId,
            ...datosCliente,
            estado: 'actualizado'
        };
    }

    // NUEVO MÉTODO: Eliminar cliente
    async eliminar(clienteId) {
        const query = `DELETE FROM t_cliente WHERE cliente_id = ?`;
        const [resultado] = await pool.execute(query, [clienteId]);
        
        return resultado.affectedRows > 0;
    }
}

module.exports = new ClientRepository();