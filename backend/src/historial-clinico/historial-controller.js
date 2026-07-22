const historialRepository = require('./historial-repository');

class HistorialController {
    async registrarHistorial(req, res) {
        try {
            const { mascotaId, citaId, peso, temperatura, diagnostico, tratamiento } = req.body;
            
            // Validamos que envíen lo más importante
            if (!mascotaId || !diagnostico) {
                return res.status(400).json({ 
                    codigo: "ERR_VALIDATION", 
                    mensaje: "El ID de la mascota y el diagnóstico son obligatorios." 
                });
            }

            const nuevoRegistro = await historialRepository.registrarHistorial(
                mascotaId, citaId, peso, temperatura, diagnostico, tratamiento
            );

            res.status(201).json({
                codigo: "SUCCESS",
                mensaje: "Historial clínico registrado con éxito",
                data: nuevoRegistro
            });
        } catch (error) {
            console.error("Error al registrar historial:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno al guardar el historial" });
        }
    }

    async obtenerHistorial(req, res) {
        try {
            const { mascotaId } = req.params; // Obtenemos el ID desde la URL
            const historial = await historialRepository.obtenerHistorialPorMascota(mascotaId);
            
            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Historial médico obtenido",
                total: historial.length,
                data: historial
            });
        } catch (error) {
            console.error("Error al obtener historial:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error al consultar el historial" });
        }
    }
}

module.exports = new HistorialController();