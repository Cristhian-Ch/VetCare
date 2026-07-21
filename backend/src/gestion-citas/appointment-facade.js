const appointmentRepository = require('./appointment-repository');

class AppointmentFacade {
    async registrarCita(datosCita) {
        console.log("1. Verificando horario... (Simulado)");
        console.log("2. Validando mascota... (Simulado)");
        console.log("3. Procesando pago... (Simulado)");
        console.log("4. Programando recordatorio... (Simulado)");
        
        console.log("5. Guardando en base de datos MySQL...");
        // ¡Llamamos al repositorio real!
        const nuevaCita = await appointmentRepository.guardar(datosCita);
        
        return nuevaCita;
    }
}

module.exports = new AppointmentFacade();