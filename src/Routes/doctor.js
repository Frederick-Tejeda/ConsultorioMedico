const { Router } = require('express');
const router = Router();
const { 
    registrarDoctor, 
    getDoctores, 
    getDoctorById, 
    asignarEspecialidad 
} = require('../Controllers/doctorControllers');
const { verify } = require('../jwt');

// ==========================================
// RUTAS PRINCIPALES DE DOCTORES
// ==========================================
router.route('/')
    .get(verify, getDoctores) // Listar todos
    .post(verify, registrarDoctor) // Registrar nuevo (idealmente solo admins deberían tener este rol)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// RUTAS DE UN DOCTOR ESPECÍFICO
// ==========================================
router.route('/:idDoctor')
    .get(verify, getDoctorById)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// GESTIÓN DE ESPECIALIDADES DEL DOCTOR
// ==========================================
router.route('/:idDoctor/especialidades')
    .post(verify, asignarEspecialidad)
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