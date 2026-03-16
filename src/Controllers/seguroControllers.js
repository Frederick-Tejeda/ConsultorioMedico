const pool = require('../database');

const controller = {};

// ==========================================
// REGISTRAR UNA NUEVA ASEGURADORA Y SU CONTACTO
// ==========================================
controller.registrarSeguro = async (req, res) => {
    // Ya no extraemos idSeguro del body
    const { nombre, tipoContacto, detalleContacto } = req.body;

    if (!nombre || !tipoContacto || !detalleContacto) {
        return res.status(400).json({ "message": "Faltan datos obligatorios", "success": false });
    }

    try {
        // La llamada ahora solo lleva 3 parámetros
        await pool.query(
            'CALL sp_registrar_seguro($1, $2, $3)', 
            [nombre, tipoContacto.toUpperCase(), detalleContacto]
        );

        return res.status(201).json({ "message": "Seguro registrado con éxito (ID generado automáticamente)", "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "message": "Error al registrar", "success": false });
    }
};

// ==========================================
// OBTENER TODAS LAS ASEGURADORAS Y SUS CONTACTOS
// ==========================================
controller.getSeguros = async (req, res) => {
    try {
        // Usamos JSON_AGG para agrupar todos los contactos dentro de un arreglo de objetos JSON
        const query = `
            SELECT 
                s.IdSeguro, 
                s.Nombre,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT('tipo', cs.TipoContacto, 'detalle', cs.DetalleContacto)
                    ) FILTER (WHERE cs.IdContactoSeguro IS NOT NULL), '[]'
                ) AS contactos
            FROM Seguro s
            LEFT JOIN ContactoSeguro cs ON s.IdSeguro = cs.IdSeguro
            GROUP BY s.IdSeguro, s.Nombre
        `;
        const { rows } = await pool.query(query);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener seguros:', error);
        return res.status(500).json({ "message": "Algo salió mal al obtener la lista de seguros...", "success": false });
    }
};

// ==========================================
// VINCULAR UN SEGURO A UN PACIENTE (HISTORIAL)
// ==========================================
controller.vincularSeguroCliente = async (req, res) => {
    const { idCliente } = req.params;
    const { idSeguro, nss, numeroAfiliado, planSeguro } = req.body;

    if (!idSeguro || !nss || !numeroAfiliado || !planSeguro) {
        return res.status(400).json({ "message": "Faltan datos para vincular el seguro al paciente", "success": false });
    }

    try {
        await pool.query(
            'CALL sp_vincular_seguro_cliente($1, $2, $3, $4, $5)', 
            [idSeguro, idCliente, nss, numeroAfiliado, planSeguro]
        );

        return res.status(201).json({ "message": "Seguro vinculado exitosamente al historial del paciente", "success": true });
    } catch (error) {
        console.error('Error al vincular seguro:', error);
        if (error.code === '23503') { 
            return res.status(404).json({ "message": "La aseguradora o el paciente no existen en el sistema", "success": false });
        }
        return res.status(500).json({ "message": "Algo salió mal al vincular el seguro...", "success": false });
    }
};

// ==========================================
// OBTENER EL HISTORIAL DE SEGUROS DE UN PACIENTE
// ==========================================
controller.getSegurosCliente = async (req, res) => {
    const { idCliente } = req.params;

    try {
        const query = `
            SELECT 
                sc.IdSeguroCliente, 
                s.IdSeguro, 
                s.Nombre AS Aseguradora, 
                sc.NSS, 
                sc.NumeroAfiliado, 
                sc.PlanSeguro
            FROM SeguroCliente sc
            JOIN Seguro s ON sc.IdSeguro = s.IdSeguro
            WHERE sc.IdCliente = $1
            ORDER BY sc.IdSeguroCliente DESC
        `;
        const { rows } = await pool.query(query, [idCliente]);

        return res.status(200).json({ historialSeguros: rows, "success": true });
    } catch (error) {
        console.error('Error al obtener seguros del cliente:', error);
        return res.status(500).json({ "message": "Algo salió mal al buscar los seguros del paciente...", "success": false });
    }
};

module.exports = controller;