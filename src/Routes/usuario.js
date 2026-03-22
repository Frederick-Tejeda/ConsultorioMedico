const { Router } = require('express');
const router = Router();
const {
    authAdmin,
    authCajero,
    createAdmin,
    createCajero,
    getUsers, 
    authUser, 
    createUser, 
    getUser, 
    updateUser, 
    getProfile, 
    updateProfile,
    deleteUser
} = require('../Controllers/usuarioControllers');
const { verifyAdmin, verifyAdmin_Client, verifyClient } = require('../jwt');

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
    .get(verifyAdmin, getUsers) 
    .post(verifyAdmin, createAdmin)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

router.route('/cajero')
    .post(verifyAdmin, createCajero)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// AUTENTICACIÓN (LOGIN)
// ==========================================
router.route('/administrador/auth')
    .post(authAdmin)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

router.route('/cajero/auth')
.post(authCajero)
.all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// OPERACIONES DE UN USUARIO ESPECÍFICO (Credenciales)
// ==========================================
router.route('/cliente/:idUser')
    .get(verifyAdmin_Client, getUser)
    .put(verifyClient, updateUser)
    .delete(verifyAdmin, deleteUser) // Solo un Admin debería poder eliminar usuarios
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }));

// ==========================================
// PERFIL DEL USUARIO (Datos de la tabla Persona)
// ==========================================
router.route('/cliente/:idUser/perfil')
    .get(verifyAdmin_Client, getProfile)
    .put(verifyClient, updateProfile)
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