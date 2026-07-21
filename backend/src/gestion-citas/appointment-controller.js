const appointmentFacade = require('./appointment-facade');

class AppointmentController {
    // Corresponde a la operación POST /citas del contrato OpenAPI
    async crearCita(req, res) {
        try {
            const datosCita = req.body;
            
            // Delegamos el flujo principal a la fachada
            const nuevaCita = await appointmentFacade.registrarCita(datosCita);
            
            // Retornamos 201 y el esquema CitaResponse
            res.status(201).json(nuevaCita);
        } catch (error) {
            // Manejo de error estructurado (previene Information Disclosure)
            res.status(400).json({ 
                codigo: "ERR_BAD_REQUEST", 
                mensaje: "Datos inválidos o error en el proceso" 
            });
        }
    }
}

module.exports = new AppointmentController();