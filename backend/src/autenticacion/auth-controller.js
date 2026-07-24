const authRepository = require('./auth-repository');
const clientRepository = require('../gestion-clientes/client-repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    // 1. Registrar un nuevo usuario en el sistema
    async registrar(req, res) {
        try {
            const { nombre, correo, password, rol } = req.body;
            
            if (!nombre || !correo || !password) {
                return res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "Nombre, correo y contraseña son obligatorios" });
            }

            const usuarioExistente = await authRepository.buscarPorCorreo(correo);
            if (usuarioExistente) {
                return res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "El correo ya está registrado" });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordEncriptada = await bcrypt.hash(password, salt);

            const nuevoUsuario = await authRepository.crearUsuario({
                nombre, correo, password: passwordEncriptada, rol
            });

            // Si es cliente, creamos su perfil en t_cliente automáticamente
            if (rol === 'cliente') {
                try {
                    await clientRepository.guardar({
                        nombre: nombre,
                        correo: correo,
                        telefono: '',
                        direccion: 'Registrado desde la app'
                    });
                } catch (clientErr) {
                    console.error("Error creando perfil de cliente asociado:", clientErr);
                    // No bloqueamos el registro si falla esto, pero dejamos log
                }
            }

            res.status(201).json({ codigo: "SUCCESS", mensaje: "Usuario registrado", data: nuevoUsuario });
        } catch (error) {
            console.error("Error al registrar:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno al registrar usuario" });
        }
    }

    // 2. Login
    async login(req, res) {
        try {
            const { correo, password } = req.body;

            const usuario = await authRepository.buscarPorCorreo(correo);
            if (!usuario) {
                return res.status(401).json({ codigo: "ERR_UNAUTHORIZED", mensaje: "Correo o contraseña incorrectos" });
            }

            const passwordValida = await bcrypt.compare(password, usuario.password);
            if (!passwordValida) {
                return res.status(401).json({ codigo: "ERR_UNAUTHORIZED", mensaje: "Correo o contraseña incorrectos" });
            }

            const payload = {
                idUsuario: usuario.usuario_id,
                nombre:    usuario.nombre,
                correo:    usuario.correo,
                rol:       usuario.rol
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

            res.status(200).json({
                codigo:  "SUCCESS",
                mensaje: "Inicio de sesión exitoso",
                token,
                usuario: payload
            });

        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno en el login" });
        }
    }

    // ── GESTIÓN DE USUARIOS (solo admin) ──────────────────────────────────

    // 3. Listar todos los usuarios
    async listarUsuarios(req, res) {
        try {
            const usuarios = await authRepository.obtenerTodos();
            // Nunca devolvemos el hash de la contraseña
            const seguros = usuarios.map(({ password, ...u }) => u);
            res.status(200).json({ codigo: "SUCCESS", data: seguros });
        } catch (error) {
            console.error("Error al listar usuarios:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error al obtener usuarios" });
        }
    }

    // 4. Actualizar usuario (nombre, rol, contraseña)
    async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { nombre, rol, correo, password } = req.body;

            const ROLES_VALIDOS = ['admin', 'veterinario', 'cliente'];
            if (rol && !ROLES_VALIDOS.includes(rol)) {
                return res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "Rol no válido. Use: admin, veterinario o cliente" });
            }

            // Proteger: no se puede editar a uno mismo desde aquí para evitar auto-bloqueo
            if (id === req.usuario?.idUsuario) {
                return res.status(403).json({ codigo: "ERR_FORBIDDEN", mensaje: "No puedes modificar tu propio rol desde este panel" });
            }

            const existe = await authRepository.buscarPorId(id);
            if (!existe) {
                return res.status(404).json({ codigo: "ERR_NOT_FOUND", mensaje: "Usuario no encontrado" });
            }

            const datos = {};
            if (nombre)   datos.nombre = nombre.trim();
            if (rol)      datos.rol    = rol;
            if (correo)   {
                const ocupado = await authRepository.buscarPorCorreo(correo);
                if (ocupado && ocupado.usuario_id !== id) {
                    return res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "Ese correo ya está en uso por otro usuario" });
                }
                datos.correo = correo.trim().toLowerCase();
            }
            if (password) {
                const salt = await bcrypt.genSalt(10);
                datos.password = await bcrypt.hash(password, salt);
            }

            await authRepository.actualizarUsuario(id, datos);
            const actualizado = await authRepository.buscarPorId(id);
            res.status(200).json({ codigo: "SUCCESS", mensaje: "Usuario actualizado", data: actualizado });
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error al actualizar usuario" });
        }
    }

    // 5. Eliminar usuario
    async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;

            if (id === req.usuario?.idUsuario) {
                return res.status(403).json({ codigo: "ERR_FORBIDDEN", mensaje: "No puedes eliminar tu propia cuenta desde este panel" });
            }

            const existe = await authRepository.buscarPorId(id);
            if (!existe) {
                return res.status(404).json({ codigo: "ERR_NOT_FOUND", mensaje: "Usuario no encontrado" });
            }

            await authRepository.eliminarUsuario(id);
            res.status(200).json({ codigo: "SUCCESS", mensaje: "Usuario eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error al eliminar usuario" });
        }
    }
}

module.exports = new AuthController();