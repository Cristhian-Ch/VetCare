const validarCreacionCita = (req, res, next) => {
    const { clienteId, mascotaId, fecha, hora, motivo } = req.body;

    // Regla 1: Todos los campos son obligatorios
    if (!clienteId || !mascotaId || !fecha || !hora || !motivo) {
        return res.status(400).json({
            codigo: "ERR_VALIDATION",
            mensaje: "Faltan datos. Se requiere clienteId, mascotaId, fecha, hora y motivo."
        });
    }

    // Regla 2: La fecha debe tener el formato correcto (YYYY-MM-DD)
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fecha)) {
        return res.status(400).json({
            codigo: "ERR_VALIDATION",
            mensaje: "El formato de fecha es incorrecto. Usa el formato YYYY-MM-DD."
        });
    }

    // Regla 3: No permitir agendar citas en el pasado
    const fechaCita = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reseteamos la hora de hoy para comparar solo los días

    if (fechaCita < hoy) {
        return res.status(400).json({
            codigo: "ERR_VALIDATION",
            mensaje: "No se puede agendar una cita en una fecha que ya pasó."
        });
    }

    // Si pasó todas las pruebas, dejamos que continúe hacia el controlador
    next();
};

module.exports = { validarCreacionCita };