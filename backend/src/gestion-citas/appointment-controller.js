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

    async actualizarCita(req, res) {
        try {
            const { id } = req.params;
            const datosCita = req.body;

            const citaActualizada = await appointmentRepository.actualizar(id, datosCita);

            if (!citaActualizada) {
                return res.status(404).json({
                    codigo: "ERR_NOT_FOUND",
                    mensaje: "No se encontró ninguna cita con el ID proporcionado"
                });
            }

            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Cita actualizada exitosamente",
                data: citaActualizada
            });
        } catch (error) {
            console.error("Error al actualizar la cita:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al actualizar la cita"
            });
        }
    }

    // NUEVO MÉTODO: Controlador de eliminación
    async eliminarCita(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await appointmentRepository.eliminar(id);

            if (!eliminado) {
                return res.status(404).json({
                    codigo: "ERR_NOT_FOUND",
                    mensaje: "No se encontró la cita que deseas eliminar"
                });
            }

            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Cita eliminada exitosamente",
                citaId: id
            });
        } catch (error) {
            console.error("Error al eliminar la cita:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al eliminar la cita"
            });
        }
    }
}

module.exports = new AppointmentController();