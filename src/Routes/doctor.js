const { Router } = require('express');
const router = Router();
const { 
    registrarDoctor, 
    getDoctores, 
    getDoctorById, 
    asignarEspecialidad,
    getReporteMensualDoctor
} = require('../Controllers/doctorControllers');
const { verifyAdmin } = require('../jwt');

// ==========================================
// RUTA DE REGISTRO DE DOCTOR (SOLO ADMIN)
// ==========================================
router.route('/administrador')
    .post(verifyAdmin, registrarDoctor) // Registrar nuevo (idealmente solo admins deberían tener este rol)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// GESTIÓN DE ESPECIALIDADES DEL DOCTOR
// ==========================================
router.route('/administrador/:idDoctor/especialidades')
    .post(verifyAdmin, asignarEspecialidad)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// REPORTE DE NÓMINA (ADMINISTRATIVO)
// ==========================================
router.route('/administrador/:idDoctor/reporte')
    .get(verifyAdmin, getReporteMensualDoctor)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));
    
// ==========================================
// RUTAS PRINCIPALES DE DOCTORES
// ==========================================
router.route('/')
    .get(verifyAdmin, getDoctores) // Listar todos
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// RUTAS DE UN DOCTOR ESPECÍFICO
// ==========================================
router.route('/:idDoctor')
    .get(verifyAdmin, getDoctorById)
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