const paymentRepository = require('./payment-repository');

class PaymentController {
    async registrarPago(req, res) {
        try {
            const { citaId, monto, metodoPago } = req.body;
            
            // Validamos que envíen todo lo necesario
            if (!citaId || !monto || !metodoPago) {
                return res.status(400).json({ 
                    codigo: "ERR_VALIDATION", 
                    mensaje: "Faltan datos. Se requiere citaId, monto y metodoPago." 
                });
            }

            // Validamos que el método de pago sea correcto
            const metodosValidos = ['Efectivo', 'Tarjeta', 'Transferencia'];
            if (!metodosValidos.includes(metodoPago)) {
                return res.status(400).json({ 
                    codigo: "ERR_VALIDATION", 
                    mensaje: "El metodoPago debe ser: Efectivo, Tarjeta o Transferencia." 
                });
            }

            const nuevoPago = await paymentRepository.registrarPago(citaId, monto, metodoPago);
            res.status(201).json({
                codigo: "SUCCESS",
                mensaje: "Pago registrado con éxito",
                data: nuevoPago
            });
        } catch (error) {
            console.error("Error al registrar pago:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno al procesar el pago" });
        }
    }

    async obtenerPagos(req, res) {
        try {
            const pagos = await paymentRepository.obtenerPagos();
            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Lista de pagos obtenida",
                total: pagos.length,
                data: pagos
            });
        } catch (error) {
            console.error("Error al obtener pagos:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error al consultar los pagos" });
        }
    }
}

module.exports = new PaymentController();