const { Router } = require('express');
const router = Router();
const { 
    registrarSeguro, 
    getSeguros, 
    vincularSeguroCliente, 
    getSegurosCliente 
} = require('../Controllers/seguroControllers');
const { verifyAdmin, verifyAdmin_Client, verifyClient } = require('../jwt');

// ==========================================
// CATÁLOGO GENERAL DE ASEGURADORAS
// ==========================================
router.route('/administrador')
    .get(verifyAdmin, getSeguros) // Listar todas las aseguradoras y sus contactos
    .post(verifyAdmin, registrarSeguro) // Registrar una nueva aseguradora
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// GESTIÓN DE SEGUROS DE UN PACIENTE ESPECÍFICO
// ==========================================
// Rutas esperadas: 
// POST /api/seguros/cliente/3 (Vincular nuevo seguro)
// GET /api/seguros/cliente/3 (Ver todo su historial de seguros)
router.route('/cliente/:idCliente')
    .get(verifyAdmin_Client, getSegurosCliente)
    .post(verifyClient, vincularSeguroCliente)
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