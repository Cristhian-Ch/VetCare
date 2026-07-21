const appointmentRepository = require('./appointment-repository');

class AppointmentController {
    async crearCita(req, res) {
        try {
            const datosCita = req.body;
            const nuevaCita = await appointmentRepository.guardar(datosCita);
            
            res.status(201).json(nuevaCita);
        } catch (error) {
            console.error("Error real en la BD:", error);
            res.status(400).json({
                codigo: "ERR_BAD_REQUEST",
                mensaje: "Datos inválidos o error en el proceso"
            });
        }
    }

    async obtenerCitas(req, res) {
        try {
            const citas = await appointmentRepository.listarTodos();
            
            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Citas recuperadas exitosamente",
                data: citas
            });
        } catch (error) {
            console.error("Error al obtener las citas:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al consultar la base de datos"
            });
        }
    }
}

module.exports = new AppointmentController();