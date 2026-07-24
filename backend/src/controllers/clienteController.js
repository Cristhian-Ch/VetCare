// Asumiendo que tienes tu conexión a MySQL en un archivo db.js

const obtenerClientes = async (req, res) => {
    try {
        
        res.json([
            { id: 1, nombre: 'Juan Pérez', telefono: '987654321', correo: 'juan@email.com' },
            { id: 2, nombre: 'María Gómez', telefono: '912345678', correo: 'maria@email.com' }
        ]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener clientes' });
    }
};

const crearCliente = async (req, res) => {
    try {
        const { nombre, telefono, correo } = req.body;
        res.status(201).json({ 
            mensaje: 'Cliente registrado exitosamente', 
            cliente: { nombre, telefono, correo } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear cliente' });
    }
};

module.exports = { obtenerClientes, crearCliente };