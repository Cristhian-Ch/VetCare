const authRepository = require('./auth-repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    // 1. Registrar un nuevo usuario en el sistema
    async registrar(req, res) {
        try {
            const { nombre, correo, password, rol } = req.body;
            
            // Verificar si el correo ya está en uso
            const usuarioExistente = await authRepository.buscarPorCorreo(correo);
            if (usuarioExistente) {
                return res.status(400).json({ codigo: "ERR_BAD_REQUEST", mensaje: "El correo ya está registrado" });
            }

            // Encriptar la contraseña (Salt de 10 rondas es el estándar seguro)
            const salt = await bcrypt.genSalt(10);
            const passwordEncriptada = await bcrypt.hash(password, salt);

            // Guardar en base de datos
            const nuevoUsuario = await authRepository.crearUsuario({
                nombre, correo, password: passwordEncriptada, rol
            });

            res.status(201).json({ codigo: "SUCCESS", mensaje: "Usuario registrado", data: nuevoUsuario });
        } catch (error) {
            console.error("Error al registrar:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno al registrar usuario" });
        }
    }

    // 2. Iniciar Sesión (Login Real)
    async login(req, res) {
        try {
            const { correo, password } = req.body;

            // Buscar al usuario por correo
            const usuario = await authRepository.buscarPorCorreo(correo);
            if (!usuario) {
                return res.status(401).json({ codigo: "ERR_UNAUTHORIZED", mensaje: "Correo o contraseña incorrectos" });
            }

            // Comparar la contraseña ingresada con la encriptada en la BD
            const passwordValida = await bcrypt.compare(password, usuario.password);
            if (!passwordValida) {
                return res.status(401).json({ codigo: "ERR_UNAUTHORIZED", mensaje: "Correo o contraseña incorrectos" });
            }

            // Generar el Token JWT real usando los datos de la BD
            const payload = {
                idUsuario: usuario.usuario_id,
                nombre: usuario.nombre,
                rol: usuario.rol
            };

            // Firmamos el token con la clave secreta de tu archivo .env
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                codigo: "SUCCESS",
                mensaje: "Inicio de sesión exitoso",
                token: token, // ¡Aquí el sistema devuelve el Token listo para usarse!
                usuario: payload
            });

        } catch (error) {
            console.error("Error en login:", error);
            res.status(500).json({ codigo: "ERR_INTERNAL", mensaje: "Error interno en el login" });
        }
    }
}

module.exports = new AuthController();