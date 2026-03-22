const pool = require('../database');

const controller = {};

// ==========================================
// VER LA FACTURA DE UNA CONSULTA (GET)
// ==========================================
controller.getFacturaByConsulta = async (req, res) => {
    const { idConsulta } = req.params;

    try {
        const { rows } = await pool.query(
            'SELECT * FROM fn_obtener_factura($1)', 
            [idConsulta]
        );

        if (rows.length === 0) {
            return res.status(404).json({ 
                "message": "No se encontró una factura para esta consulta", 
                "success": false 
            });
        }

        return res.status(200).json({ "factura": rows[0], "success": true });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        return res.status(500).json({ "message": "Algo salió mal al buscar la factura...", "success": false });
    }
};

// ==========================================
// PROCESAR EL PAGO EN CAJA (PUT)
// ==========================================
controller.pagarFactura = async (req, res) => {
    const { idFactura } = req.params;

    try {
        await pool.query('CALL sp_pagar_factura($1)', [idFactura]);

        return res.status(200).json({ "message": "Pago procesado exitosamente", "success": true });
    } catch (error) {
        console.error('Error al procesar pago:', error);

        // Atrapamos las validaciones personalizadas de PostgreSQL
        if (error.message.includes('FACTURA_NO_ENCONTRADA')) {
            return res.status(404).json({ "message": "La factura indicada no existe.", "success": false });
        }

        if (error.message.includes('FACTURA_YA_PAGADA')) {
            return res.status(409).json({ "message": "Esta factura ya había sido pagada.", "success": false });
        }

        return res.status(500).json({ "message": "Algo salió mal al procesar el pago...", "success": false });
    }
};

module.exports = controller;