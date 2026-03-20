const { Router } = require('express');
const router = Router();
const {
    authAdmin,
    createAdmin,
    getUsers, 
    authUser, 
    createUser, 
    getUser, 
    updateUser, 
    getProfile, 
    updateProfile,
    deleteUser
} = require('../Controllers/usuarioControllers');
const { verify } = require('../jwt');

// ==========================================
// RUTAS BASE DE USUARIOS
// ==========================================
router.route('/cliente')
    .post(createUser) // Registro público (creación de cuenta)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// AUTENTICACIÓN (LOGIN)
// ==========================================
router.route('/cliente/auth')
    .post(authUser)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// RUTAS BASE DE Administradores
// ==========================================
router.route('/administrador')
    .get(verify, getUsers) 
    .post(createAdmin)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// AUTENTICACIÓN (LOGIN)
// ==========================================
router.route('/administrador/auth')
    .post(authAdmin)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// OPERACIONES DE UN USUARIO ESPECÍFICO (Credenciales)
// ==========================================
router.route('/cliente/:idUser')
    .get(verify, getUser)
    .put(verify, updateUser)
    .delete(verify, deleteUser) // Solo un Admin debería poder eliminar usuarios
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// PERFIL DEL USUARIO (Datos de la tabla Persona)
// ==========================================
router.route('/cliente/:idUser/perfil')
    .get(verify, getProfile)
    .put(verify, updateProfile)
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