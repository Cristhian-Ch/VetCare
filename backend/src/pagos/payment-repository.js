const pool = require('../database');
const { v4: uuidv4 } = require('uuid');

class PaymentRepository {
    async registrarPago(citaId, monto, metodoPago) {
        const pagoId = uuidv4();
        const query = `
            INSERT INTO t_pago (pago_id, cita_id, monto, metodo_pago, estado)
            VALUES (?, ?, ?, ?, 'Completado')
        `;
        
        await pool.execute(query, [pagoId, citaId, monto, metodoPago]);
        
        // Devolvemos un resumen del pago recién insertado
        return { pagoId, citaId, monto, metodoPago, estado: 'Completado' };
    }

    async obtenerPagos() {
        // Usamos LEFT JOIN para que el pago siempre aparezca, incluso si faltan datos enlazados
        const query = `
            SELECT 
                p.pago_id, 
                p.monto, 
                p.metodo_pago, 
                p.fecha_pago, 
                p.estado, 
                c.fecha AS fecha_cita, 
                cl.nombre AS cliente_nombre, 
                m.nombre AS mascota_nombre
            FROM t_pago p
            LEFT JOIN t_cita c ON p.cita_id = c.cita_id
            LEFT JOIN t_cliente cl ON c.cliente_id = cl.cliente_id
            LEFT JOIN t_mascota m ON c.mascota_id = m.mascota_id
            ORDER BY p.fecha_pago DESC
        `;
        const [filas] = await pool.execute(query);
        return filas;
    }
}

module.exports = new PaymentRepository();