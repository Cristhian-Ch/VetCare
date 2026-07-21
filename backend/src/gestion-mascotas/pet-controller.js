const petRepository = require('./pet-repository');

class PetController {
    async crearMascota(req, res) {
        try {
            const nuevaMascota = await petRepository.guardar(req.body);
            res.status(201).json({ codigo: "SUCCESS", mensaje: "Mascota registrada", data: nuevaMascota });
        } catch (error) {
            console.error("Error al registrar mascota:", error);
            res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "Error al registrar la mascota" });
        }
    }

    async obtenerMascotas(req, res) {
        try {
            const mascotas = await petRepository.listarTodos();
            res.status(200).json({ codigo: "SUCCESS", mensaje: "Mascotas recuperadas", data: mascotas });
        } catch (error) {
            console.error("Error al obtener mascotas:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno" });
        }
    }

    async actualizarMascota(req, res) {
        try {
            const mascotaActualizada = await petRepository.actualizar(req.params.id, req.body);
            if (!mascotaActualizada) return res.status(404).json({ codigo: "ERR_NOT_FOUND", mensaje: "Mascota no encontrada" });
            res.status(200).json({ codigo: "SUCCESS", mensaje: "Mascota actualizada", data: mascotaActualizada });
        } catch (error) {
            console.error("Error al actualizar mascota:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno" });
        }
    }

    async eliminarMascota(req, res) {
        try {
            const eliminado = await petRepository.eliminar(req.params.id);
            if (!eliminado) return res.status(404).json({ codigo: "ERR_NOT_FOUND", mensaje: "Mascota no encontrada" });
            res.status(200).json({ codigo: "SUCCESS", mensaje: "Mascota eliminada", mascotaId: req.params.id });
        } catch (error) {
            console.error("Error al eliminar mascota:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno" });
        }
    }
}

module.exports = new PetController();