const { Router } = require('express');
const router = Router();
const { 
    registrarDoctor, 
    getDoctores, 
    getDoctorById, 
    asignarEspecialidad,
    getReporteMensualDoctor
} = require('../Controllers/doctorControllers');
const { verify } = require('../jwt');

// ==========================================
// RUTA DE REGISTRO DE DOCTOR (SOLO ADMIN)
// ==========================================
router.route('/administrador')
    .post(verify, registrarDoctor) // Registrar nuevo (idealmente solo admins deberían tener este rol)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// GESTIÓN DE ESPECIALIDADES DEL DOCTOR
// ==========================================
router.route('/administrador/:idDoctor/especialidades')
    .post(verify, asignarEspecialidad)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// REPORTE DE NÓMINA (ADMINISTRATIVO)
// ==========================================
router.route('/administrador/:idDoctor/reporte')
    .get(verify, getReporteMensualDoctor)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));
    
// ==========================================
// RUTAS PRINCIPALES DE DOCTORES
// ==========================================
router.route('/')
    .get(verify, getDoctores) // Listar todos
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// RUTAS DE UN DOCTOR ESPECÍFICO
// ==========================================
router.route('/:idDoctor')
    .get(verify, getDoctorById)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ==========================================
router.use((req, res) => {
    res.status(404).send({ 
        message: 'Not Found', 
        path: req.originalUrl 
    });
});

module.exports = router;