const pool = require('../database');

const controller = {};

// ==========================================
// AGENDAR UNA NUEVA CONSULTA
// ==========================================
controller.agendarConsulta = async (req, res) => {
    const { idCliente, idDoctor, idEspecialidad, fecha, prioridad, idSeguroCliente } = req.body;

    // Validación básica
    if (!idCliente || !idEspecialidad || !idDoctor || !fecha || !prioridad) {
        return res.status(400).json({ "message": "Faltan datos requeridos (cliente, doctor, especialidad, fecha o prioridad)", "success": false });
    }

    try {
        const seguroId = idSeguroCliente ? idSeguroCliente : null;

        // Llamamos al procedimiento almacenado usando CALL
        await pool.query(
            'CALL sp_agendar_consulta($1, $2, $3, $4, $5, $6)', 
            [idCliente, idDoctor, idEspecialidad, seguroId, fecha, prioridad]
        );

        return res.status(201).json({ "message": "Consulta agendada exitosamente", "success": true });
    } catch (error) {
        console.error('Error al agendar consulta:', error);
        // 1. Atrapamos nuestra validación personalizada de la base de datos
        if (error.message.includes('VALIDATION_ERROR')) {
            return res.status(400).json({ 
                "message": "El doctor seleccionado no atiende la especialidad que solicitó.", 
                "success": false 
            });
        }
        // 2. Manejo de errores de llave foránea (si mandan un ID que no existe)
        if (error.code === '23503') { 
            return res.status(404).json({ 
                "message": "El cliente, doctor, especialidad o seguro no existe en el sistema", 
                "success": false 
            });
        }
        return res.status(500).json({ 
            "message": "Algo salió mal al agendar la consulta...", 
            "success": false 
        });
    }
};

// ==========================================
// OBTENER EL HISTORIAL DE UN PACIENTE
// ==========================================
controller.getHistorialPaciente = async (req, res) => {
    const { idCliente } = req.params;

    try {
        // Llamamos a la función usando SELECT * FROM
        const { rows } = await pool.query(
            'SELECT * FROM fn_obtener_historial_paciente($1)', 
            [idCliente]
        );

        // Si no hay filas, simplemente devolvemos un array vacío (no es un error, solo un paciente nuevo)
        return res.status(200).json({ "historial": rows, "success": true });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        return res.status(500).json({ "message": "Algo salió mal al consultar el historial...", "success": false });
    }
};

// ==========================================
// ACTUALIZAR EL ESTADO DE UNA CONSULTA
// ==========================================
controller.updateEstadoConsulta = async (req, res) => {
    const { idConsulta } = req.params;
    const { nuevoEstado } = req.body; // Ej: 'COMPLETADA', 'CANCELADA '

    if (!nuevoEstado) {
        return res.status(400).json({ "message": "Debe especificar el nuevo estado", "success": false });
    }

    // Aseguramos que el estado tenga el formato correcto (mayúsculas y sin espacios extra)
    const estadoLimpio = nuevoEstado.trim().toUpperCase();

    try {
        await pool.query(
            'CALL sp_actualizar_estado_consulta($1, $2)', 
            [idConsulta, estadoLimpio]
        );

        return res.status(200).json({ "message": "Estado de la consulta actualizado", "success": true });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        
        // Capturamos la violación del CONSTRAINT CHECK de estados permitidos (23514)
        if (error.code === '23514') {
            return res.status(400).json({ "message": "El estado proporcionado no es válido", "success": false });
        }

        return res.status(500).json({ "message": "Algo salió mal al actualizar la consulta...", "success": false });
    }
};

module.exports = controller;