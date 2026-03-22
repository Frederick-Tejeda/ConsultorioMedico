const { Router } = require('express');
const router = Router();
const { 
    agendarConsulta, 
    getHistorialPaciente, 
    updateEstadoConsulta 
} = require('../Controllers/consultaControllers');
const { verifyCashier_Client, verifyAdmin_Client } = require('../jwt');

// ==========================================
// AGENDAR NUEVA CONSULTA
// ==========================================
router.route('/')
    // Usamos verify porque solo usuarios autenticados (pacientes o admins) deberían agendar
    .post(verifyCashier_Client, agendarConsulta)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// OBTENER HISTORIAL MÉDICO DE UN PACIENTE
// ==========================================
// Ruta esperada: GET /api/consultas/paciente/5
router.route('/paciente/:idCliente')
    .get(verifyAdmin_Client, getHistorialPaciente)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// ACTUALIZAR ESTADO DE LA CONSULTA
// ==========================================
// Ruta esperada: PUT /api/consultas/12/estado
router.route('/:idConsulta/estado')
    .put(verifyCashier_Client, updateEstadoConsulta)
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