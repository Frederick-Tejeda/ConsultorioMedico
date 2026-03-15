const { decode } = require('jsonwebtoken');
const { Encrypt, Decrypt } = require('../crypt');
const { sign } = require('../jwt');
const pool = require('../database');

const controller = {}

// Admin Controllers

controller.getUsers = async (req, res) => {
    try {
        // Obtenemos los usuarios sin devolver las contraseñas por seguridad
        const { rows } = await pool.query('SELECT IdUsuario, Correo, TipoUsuario FROM Usuario WHERE TipoUsuario <> \'A\' ');
        return res.status(200).json(rows);
    } catch(error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong...', "success": false});
    }
}

controller.authAdmin = async (req, res) => {
    const { correo, password } = req.body;
    if(!correo || !password) return res.status(400).json({"message": 'Faltan credenciales', "success": false});
    
    try {
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE Correo = $1', [correo]);
        
        if(rows.length === 0) return res.status(404).json({"message": 'Admin no exist...', "success": false});
        
        const admin = rows[0];
        
        const decryptedPassword = Decrypt(admin.contrasena);
        
        if(decryptedPassword[0] === "ERR") return res.status(500).json({"message": decryptedPassword[1], "success": false});
        if(decryptedPassword[1] !== password) return res.status(401).json({"message": 'Wrong password...', "success": false});
        
        sign({ id: admin.IdUsuario }).then( ([status, token]) => {
            if(!status) return res.status(500).json({"message": token, "success": false});
            return res.status(200).json({"idAdmin": admin.idusuario, "token": token, "tipo": admin.tipousuario, "success": true});
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong...', "success": false});
    }
}

controller.createAdmin = async (req, res) => {
    // Recibimos todos los datos necesarios para las 3 tablas
    const { correo, password, nombre } = req.body;
    
    // Validación básica de campos vacíos
    if (!correo || !password || !nombre) {
        return res.status(400).json({ "message": "Faltan datos obligatorios para completar el registro", "success": false });
    }

    try {
        // 1. Verificamos si el correo ya existe para no hacer procesos innecesarios
        const checkUser = await pool.query('SELECT * FROM Usuario WHERE Correo = $1', [correo]);
        if(checkUser.rows.length > 0) {
            return res.status(409).json({ "message": "El correo ya está registrado", "success": false});
        }

        // 2. Encriptamos la contraseña usando tu módulo
        const encryptedPassword = Encrypt(password);
        if(encryptedPassword[0] === "ERR") {
            return res.status(500).json({ "message": encryptedPassword[1], "success": false});
        }
        
        // 3. Ejecutamos el procedimiento almacenado pasando los 3 parámetros
        await pool.query(
            'CALL sp_registrar_administrador($1, $2, $3)', 
            [correo, encryptedPassword[1], nombre]
        );
        
        return res.status(201).json({ "message": "Administrador registrado exitosamente", "success": true });
    } catch(error) {
        console.error('Error al registrar administrador:', error);
        return res.status(500).json({"message": "Algo salió mal al registrar el administrador...", "success": false});
    }
}

// Client Controllers
controller.authUser = async (req, res) => {
    const { correo, password } = req.body;
    if(!correo || !password) return res.status(400).json({"message": 'Faltan credenciales', "success": false});
    
    try {
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE Correo = $1', [correo]);
        
        if(rows.length === 0) return res.status(404).json({"message": 'User no exist...', "success": false});
        
        const user = rows[0];
        const decryptedPassword = Decrypt(user.contrasena);
        
        if(decryptedPassword[0] === "ERR") return res.status(500).json({"message": decryptedPassword[1], "success": false});
        if(decryptedPassword[1] !== password) return res.status(401).json({"message": 'Wrong password...', "success": false});
        
        sign({ id: user.IdUsuario }).then( ([status, token]) => {
            if(!status) return res.status(500).json({"message": token, "success": false});
            return res.status(200).json({"idUser": user.idusuario, "token": token, "tipo": user.tipousuario, "success": true});
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong...', "success": false});
    }
}

controller.createUser = async (req, res) => {
    // Recibimos todos los datos necesarios para las 3 tablas
    const { correo, password, nombres, apellidos, telefono, tipoId, detalleId, fechaNac } = req.body;
    
    // Validación básica de campos vacíos
    if (!correo || !password || !nombres || !apellidos || !telefono || !tipoId || !detalleId || !fechaNac) {
        return res.status(400).json({ "message": "Faltan datos obligatorios para completar el registro", "success": false });
    }

    try {
        // 1. Verificamos si el correo ya existe para no hacer procesos innecesarios
        const checkUser = await pool.query('SELECT 1 FROM Usuario WHERE Correo = $1', [correo]);
        if(checkUser.rows.length > 0) {
            return res.status(409).json({ "message": "El correo ya está registrado", "success": false});
        }

        // 2. Encriptamos la contraseña usando tu módulo
        const encryptedPassword = Encrypt(password);
        if(encryptedPassword[0] === "ERR") {
            return res.status(500).json({ "message": encryptedPassword[1], "success": false});
        }
        
        // 3. Ejecutamos el procedimiento almacenado pasando los 8 parámetros
        await pool.query(
            'CALL sp_registrar_cliente($1, $2, $3, $4, $5, $6, $7, $8)', 
            [correo, encryptedPassword[1], nombres, apellidos, telefono, tipoId, detalleId, fechaNac]
        );
        
        return res.status(201).json({ "message": "Cliente registrado exitosamente", "success": true });
    } catch(error) {
        console.error('Error al registrar cliente:', error);
        
        // Capturar error de identificación duplicada (violación del UNIQUE de Persona)
        if (error.code === '23505') {
            return res.status(409).json({ "message": "Esta identificación (Cédula/Pasaporte) ya está registrada", "success": false });
        }

        return res.status(500).json({"message": "Algo salió mal al crear el usuario...", "success": false});
    }
}

controller.getUser = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE IdUsuario = $1 AND TipoUsuario = $2', [req.params.idUser, 'C']);
        
        if(rows.length === 0) return res.status(404).json({"message": 'User no exist...', "success": false});
        
        const user = rows[0];
        const decryptedPassword = Decrypt(user.contrasena);
        
        if(decryptedPassword[0] === "ERR") return res.status(500).json({"message": decryptedPassword[1], "success": false});
        
        user.Contrasena = decryptedPassword[1]; // O puedes omitirla si no quieres enviarla al frontend
        return res.status(200).json({ user, "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong...', "success": false});
    }
}

controller.updateUser = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE IdUsuario = $1 AND TipoUsuario = $2', [req.params.idUser, 'C']);
        if (rows.length === 0) return res.status(404).json({"message": 'User not found', "success": false});

        const { correo, password } = req.body;
        const encryptedPassword = Encrypt(password);
        if(encryptedPassword[0] === "ERR") return res.status(500).json({"message": encryptedPassword[1], "success": false});

        await pool.query(
            'UPDATE Usuario SET Correo = $1, Contrasena = $2 WHERE IdUsuario = $3',
            [correo, encryptedPassword[1], req.params.idUser]
        );

        return res.status(200).json({ "message": 'User updated', "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong while updating...', "success": false});
    }
}

controller.getProfile = async (req, res) => {
    try {
        const query = `
            SELECT p.*
            FROM Persona p
            INNER JOIN Cliente c ON p.IdPersona = c.IdPersona
            WHERE c.IdUsuario = $1
        `;
        const { rows } = await pool.query(query, [req.params.idUser]);
        
        if(rows.length === 0) return res.status(404).json({"message": 'Perfil (Persona) not found for this user', "success": false});
        
        return res.status(200).json({ perfil: rows[0], "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong...', "success": false});
    }
}

controller.updateProfile = async (req, res) => {
    try {
        const { nombres, apellidos, telefono, tipoId, detalleId, fechaNac } = req.body;
        
        // 1. Encontrar el IdPersona vinculado a este Usuario (asumiendo que es un Cliente)
        const clienteRes = await pool.query('SELECT IdPersona FROM Cliente WHERE IdUsuario = $1', [req.params.idUser]);
        
        if(clienteRes.rows.length === 0) return res.status(404).json({"message": 'User has no client profile associated', "success": false});
        
        const idPersona = clienteRes.rows[0].idpersona;

        // 2. Actualizar los datos en la tabla Persona
        await pool.query(
            `UPDATE Persona 
             SET Nombres = $1, Apellidos = $2, Telefono = $3, TipoIdentificacion = $4, DetalleIdentificacion = $5, FechaNacimiento = $6
             WHERE IdPersona = $7`,
            [nombres, apellidos, telefono, tipoId, detalleId, fechaNac,idPersona]
        );

        return res.status(200).json({ "message": "Profile updated successfully.", "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({"message": 'Something went wrong updating the profile...', "success": false});
    }
}

controller.deleteUser = async (req, res) => {
    try {
        const result = await pool.query('CALL sp_borrar_usuario($1)', [req.params.idUser]);
        
        if(result.rowCount === 0) return res.status(404).json({"message": 'User not found or already deleted', "success": false});
        
        return res.status(200).json({"message": 'User deleted', "success": true});
    } catch (error) {
        console.error(error);
        // Atrapamos el error de llave foránea (23503 en Postgres)
        if(error.code === '23503') return res.status(409).json({"message": 'Cannot delete user because it has associated data', "success": false});
        return res.status(500).json({"message": 'Something went wrong while deleting...', "success": false});
    }
}

module.exports = controller;