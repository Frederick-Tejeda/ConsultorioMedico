const { Router } = require('express');
const router = Router();
const { 
    agendarConsulta, 
    getHistorialPaciente, 
    updateEstadoConsulta 
} = require('../Controllers/consultaControllers');
const { verify } = require('../jwt');

// ==========================================
// AGENDAR NUEVA CONSULTA
// ==========================================
router.route('/')
    // Usamos verify porque solo usuarios autenticados (pacientes o admins) deberían agendar
    .post(verify, agendarConsulta)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// OBTENER HISTORIAL MÉDICO DE UN PACIENTE
// ==========================================
// Ruta esperada: GET /api/consultas/paciente/5
router.route('/paciente/:idCliente')
    .get(verify, getHistorialPaciente)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// ACTUALIZAR ESTADO DE LA CONSULTA
// ==========================================
// Ruta esperada: PUT /api/consultas/12/estado
router.route('/:idConsulta/estado')
    .put(verify, updateEstadoConsulta)
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