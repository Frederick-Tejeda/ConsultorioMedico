const pool = require('../database');

const controller = {};

// ==========================================
// REGISTRAR UN NUEVO DOCTOR
// ==========================================
controller.registrarDoctor = async (req, res) => {
    const { nombres, apellidos, telefono, tipoId, detalleId, fechaNac } = req.body;

    if (!nombres || !apellidos || !telefono || !tipoId || !detalleId || !fechaNac) {
        return res.status(400).json({ "message": "Faltan datos personales para registrar al doctor", "success": false });
    }

    try {
        // Llama al procedimiento almacenado que inserta en Persona y luego en Doctor
        await pool.query(
            'CALL sp_registrar_doctor($1, $2, $3, $4, $5, $6)', 
            [nombres, apellidos, telefono, tipoId, detalleId, fechaNac]
        );

        return res.status(201).json({ "message": "Doctor registrado exitosamente", "success": true });
    } catch (error) {
        console.error('Error al registrar doctor:', error);
        // Captura violación de unicidad (ej. misma cédula ya registrada en Persona)
        if (error.code === '23505') {
            return res.status(409).json({ "message": "Ya existe una persona con esta identificación", "success": false });
        }
        return res.status(500).json({ "message": "Algo salió mal al registrar al doctor...", "success": false });
    }
};

// ==========================================
// OBTENER TODOS LOS DOCTORES CON SUS ESPECIALIDADES
// ==========================================
controller.getDoctores = async (req, res) => {
    try {
        // Usamos ARRAY_AGG para agrupar las especialidades en un arreglo limpio
        const query = `
            SELECT 
                d.IdDoctor, 
                p.Nombres, 
                p.Apellidos, 
                p.Telefono,
                COALESCE(ARRAY_AGG(e.Nombre) FILTER (WHERE e.Nombre IS NOT NULL), '{}') AS especialidades
            FROM Doctor d
            JOIN Persona p ON d.IdPersona = p.IdPersona
            LEFT JOIN EspecialidadDoctor ed ON d.IdDoctor = ed.IdDoctor
            LEFT JOIN Especialidad e ON ed.IdEspecialidad = e.IdEspecialidad
            GROUP BY d.IdDoctor, p.Nombres, p.Apellidos, p.Telefono
        `;
        const { rows } = await pool.query(query);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener doctores:', error);
        return res.status(500).json({ "message": "Algo salió mal al obtener la lista de doctores...", "success": false });
    }
};

// ==========================================
// OBTENER UN DOCTOR POR ID
// ==========================================
controller.getDoctorById = async (req, res) => {
    const { idDoctor } = req.params;

    try {
        const query = `
            SELECT 
                d.IdDoctor, p.Nombres, p.Apellidos, p.Telefono, p.TipoIdentificacion, p.DetalleIdentificacion,
                COALESCE(ARRAY_AGG(e.Nombre) FILTER (WHERE e.Nombre IS NOT NULL), '{}') AS especialidades
            FROM Doctor d
            JOIN Persona p ON d.IdPersona = p.IdPersona
            LEFT JOIN EspecialidadDoctor ed ON d.IdDoctor = ed.IdDoctor
            LEFT JOIN Especialidad e ON ed.IdEspecialidad = e.IdEspecialidad
            WHERE d.IdDoctor = $1
            GROUP BY d.IdDoctor, p.Nombres, p.Apellidos, p.Telefono, p.TipoIdentificacion, p.DetalleIdentificacion
        `;
        const { rows } = await pool.query(query, [idDoctor]);

        if (rows.length === 0) {
            return res.status(404).json({ "message": "Doctor no encontrado", "success": false });
        }

        return res.status(200).json({ "doctor": rows[0], "success": true });
    } catch (error) {
        console.error('Error al obtener el doctor:', error);
        return res.status(500).json({ "message": "Algo salió mal al buscar el doctor...", "success": false });
    }
};

// ==========================================
// ASIGNAR UNA ESPECIALIDAD A UN DOCTOR
// ==========================================
controller.asignarEspecialidad = async (req, res) => {
    const { idDoctor } = req.params;
    const { idEspecialidad } = req.body;

    if (!idEspecialidad) {
        return res.status(400).json({ "message": "Debe proporcionar el ID de la especialidad", "success": false });
    }

    try {
        await pool.query(
            'CALL sp_asignar_especialidad_doctor($1, $2)', 
            [idDoctor, idEspecialidad]
        );

        return res.status(201).json({ "message": "Especialidad asignada correctamente al doctor", "success": true });
    } catch (error) {
        console.error('Error al asignar especialidad:', error);
        if (error.code === '23503') { 
            return res.status(404).json({ "message": "El doctor o la especialidad no existen", "success": false });
        }
        if (error.code === '23505') { 
            return res.status(409).json({ "message": "El doctor ya tiene asignada esta especialidad", "success": false });
        }
        return res.status(500).json({ "message": "Algo salió mal al asignar la especialidad...", "success": false });
    }
};

// ==========================================
// REPORTE MENSUAL PARA NÓMINA DE UN DOCTOR
// ==========================================
controller.getReporteMensualDoctor = async (req, res) => {
    const { idDoctor } = req.params;
    
    // Extraemos mes y año de los query parameters (ej: ?mes=3&anio=2026)
    const { mes, anio } = req.query; 

    if (!mes || !anio) {
        return res.status(400).json({ 
            "message": "Debe proporcionar el mes y el año en la URL (ej. ?mes=3&anio=2026)", 
            "success": false 
        });
    }

    try {
        const query = `
            SELECT 
                cc.IdConsultasCliente,
                cc.Fecha,
                e.Nombre AS EspecialidadAtendida,
                p.Nombres AS NombrePaciente,
                p.Apellidos AS ApellidoPaciente,
                f.SubTotal AS MontoGenerado,
                f.EstadoPago
            FROM ConsultasCliente cc
            JOIN Especialidad e ON cc.IdEspecialidad = e.IdEspecialidad
            JOIN Cliente c ON cc.IdCliente = c.IdCliente
            JOIN Persona p ON c.IdPersona = p.IdPersona
            JOIN Factura f ON cc.IdConsultasCliente = f.IdConsultasCliente
            WHERE cc.IdDoctor = $1 
              AND cc.Estado = 'COMPLETADA' 
              AND EXTRACT(MONTH FROM cc.Fecha) = $2
              AND EXTRACT(YEAR FROM cc.Fecha) = $3
            ORDER BY cc.Fecha ASC;
        `;
        
        const { rows } = await pool.query(query, [idDoctor, mes, anio]);

        const totalGenerado = rows.reduce((acc, curr) => acc + parseFloat(curr.montogenerado), 0);

        return res.status(200).json({ 
            "reporte": {
                "mes": parseInt(mes),
                "anio": parseInt(anio),
                "totalCitasAtendidas": rows.length,
                "totalGenerado": totalGenerado
            },
            "detalleConsultas": rows, 
            "success": true 
        });

    } catch (error) {
        console.error('Error al generar reporte de nómina:', error);
        return res.status(500).json({ "message": "Algo salió mal al obtener el reporte...", "success": false });
    }
};

module.exports = controller;