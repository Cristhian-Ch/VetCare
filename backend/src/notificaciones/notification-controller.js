const notificationRepository = require('./notification-repository');

class NotificationController {
    async obtenerRecordatorios(req, res) {
        try {
            const recordatorios = await notificationRepository.obtenerRecordatoriosDeHoy();
            
            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: recordatorios.length > 0 ? "Recordatorios de hoy listos" : "No hay citas programadas para hoy",
                total: recordatorios.length,
                data: recordatorios
            });
        } catch (error) {
            console.error("Error al obtener recordatorios:", error);
            res.status(500).json({ 
                codigo: "ERR_INTERNAL", 
                mensaje: "Error interno al generar los recordatorios" 
            });
        }
    }
}

module.exports = new NotificationController();