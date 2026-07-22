# <img src="https://cdn-icons-png.flaticon.com/512/2809/2809825.png" height="40" align="top"> Sistema VetCare

Plataforma backend diseñada para centralizar, automatizar y optimizar los procesos operativos y administrativos de una clínica veterinaria.

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express Framework](https://img.shields.io/badge/Express-v5.2.1-lightgrey.svg)](https://expressjs.com/)
[![MySQL Database](https://img.shields.io/badge/MySQL-Relacional-blue.svg)](https://www.mysql.com/)
[![Licencia](https://img.shields.io/badge/Licencia-Uso_Académico-red.svg)]()

**Universidad Nacional Jorge Basadre Grohmann (UNJBG)**
*Facultad de Ingeniería - Escuela Profesional de Ingeniería en Informática y Sistemas*
Proyecto Final - Diseño de Sistemas | Tacna, 2026

## Equipo de Desarrollo

* Luis David Cruz Llica
* Jose Antonio Vilcanqui Chambi
* Cristian Chura Peralta

## Resumen del Proyecto

El sistema asegura la integridad de los datos médicos y financieros mediante una arquitectura robusta, garantizando escalabilidad y seguridad en las transacciones de la clínica.

**Alcance Funcional (Módulos Principales)**
* **Autenticación y Seguridad:** Control de acceso basado en roles utilizando tokens transaccionales (JWT).
* **Clientes y Mascotas:** Gestión relacional de perfiles de dueños y vinculación de expedientes de pacientes.
* **Citas Médicas:** Agendamiento y seguimiento de consultas veterinarias.
* **Historial Clínico:** Registro inmutable de diagnósticos, peso, temperatura y tratamientos aplicados.
* **Pagos y Facturación:** Procesamiento y reporte financiero de transacciones vinculadas a los servicios.

## Arquitectura y Stack Tecnológico

El proyecto está desarrollado bajo el patrón de **Arquitectura Monolítica Modular**, separando responsabilidades lógicas en Controladores, Repositorios (Capa de Datos) y Rutas.

| Tecnología | Versión | Propósito en el Sistema |
| :--- | :---: | :--- |
| **Node.js** | v18+ | Entorno de ejecución de servidor. |
| **Express.js** | v5.2.1 | Framework para el enrutamiento de la API REST. |
| **MySQL2** | v3.23.1 | Motor de base de datos relacional. |
| **JWT & Bcrypt** | v9.0 / v3.0 | Generación de tokens de seguridad y encriptación. |
| **UUID** | v14.0.1 | Generación de identificadores únicos universales. |

## Instalación y Despliegue Local

Siga los pasos a continuación para inicializar el entorno de desarrollo en su máquina local:

### 1. Clonación del Repositorio
```bash
git clone https://github.com/Cristhian-Ch/VetCare.git
```
### 2. Configuración de Variables de Entorno

Cree un archivo denominado .env en la raíz del directorio backend con la siguiente estructura:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=su_contraseña_de_mysql
DB_NAME=vetcare_db
JWT_SECRET=clave_criptografica_secreta_vetcare
```
### 3. Preparación de la Base de Datos

Inicie su servidor MySQL local.

Utilice un cliente SQL para crear la base de datos vetcare_db.

Ejecute los scripts DDL provistos en el proyecto para inicializar las tablas.

Inserte un usuario administrador base en la tabla t_usuario.

### 4. Ejecución del Servidor Web

Para iniciar la API en modo desarrollo con recarga en caliente, ejecute:
```bash
npm run dev
```