const clientRepository = require('./client-repository');

class ClientController {
    async crearCliente(req, res) {
        try {
            const datosCliente = req.body;
            const nuevoCliente = await clientRepository.guardar(datosCliente);
            
            res.status(201).json({
                codigo: "SUCCESS",
                mensaje: "Cliente registrado exitosamente",
                data: nuevoCliente
            });
        } catch (error) {
            console.error("Error al registrar el cliente:", error);
            res.status(400).json({
                codigo: "ERR_BAD_REQUEST",
                mensaje: "No se pudo registrar el cliente, verifique los datos"
            });
        }
    }

    async obtenerClientes(req, res) {
        try {
            const clientes = await clientRepository.listarTodos();
            
            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Clientes recuperados exitosamente",
                data: clientes
            });
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al consultar la base de datos"
            });
        }
    }

    // NUEVO MÉTODO: Actualizar Cliente
    async actualizarCliente(req, res) {
        try {
            const { id } = req.params;
            const datosCliente = req.body;

            const clienteActualizado = await clientRepository.actualizar(id, datosCliente);

            if (!clienteActualizado) {
                return res.status(404).json({
                    codigo: "ERR_NOT_FOUND",
                    mensaje: "No se encontró ningún cliente con el ID proporcionado"
                });
            }

            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Cliente actualizado exitosamente",
                data: clienteActualizado
            });
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al actualizar el cliente"
            });
        }
    }

    // NUEVO MÉTODO: Eliminar Cliente
    async eliminarCliente(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await clientRepository.eliminar(id);

            if (!eliminado) {
                return res.status(404).json({
                    codigo: "ERR_NOT_FOUND",
                    mensaje: "No se encontró el cliente que deseas eliminar"
                });
            }

            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Cliente eliminado exitosamente",
                clienteId: id
            });
        } catch (error) {
            console.error("Error al eliminar el cliente:", error);
            res.status(500).json({
                codigo: "ERR_INTERNAL",
                mensaje: "Error interno al eliminar el cliente"
            });
        }
    }
}

module.exports = new ClientController();