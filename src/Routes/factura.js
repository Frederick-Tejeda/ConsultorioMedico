const { Router } = require('express');
const router = Router();
const { 
    getFacturaByConsulta, 
    pagarFactura 
} = require('../Controllers/facturaController');
const { verify } = require('../jwt');

// ==========================================
// OBTENER FACTURA POR ID DE CONSULTA
// Ruta esperada: GET /api/facturas/consulta/15
// ==========================================
router.route('/consulta/:idConsulta')
    .get(verify, getFacturaByConsulta)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// PROCESAR PAGO POR ID DE FACTURA
// Ruta esperada: PUT /api/facturas/8/pagar
// ==========================================
router.route('/:idFactura/pagar')
    .put(verify, pagarFactura)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// MANEJO 404
// ==========================================
router.use((req, res) => {
    res.status(404).send({ message: 'Not Found', path: req.originalUrl });
});

module.exports = router;