const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_KEY;

const controller = {}

controller.verifyAny = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'A' && decoded.TipoUsuario !== 'C' && decoded.TipoUsuario !== 'J') return res.status(403).json({ message: "Forbidden. Unauthorized access." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.verifyClient = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'C') return res.status(403).json({ message: "Forbidden. Clients only." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.verifyAdmin = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'A') return res.status(403).json({ message: "Forbidden. Admins only." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.verifyCashier = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'J') return res.status(403).json({ message: "Forbidden. Cashiers only." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.verifyAdmin_Client = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'A' && decoded.TipoUsuario !== 'C') return res.status(403).json({ message: "Forbidden. Admins and Clients only." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.verifyCashier_Client = async function(req, res, next){
    const token = req.headers['authorization'];

    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        if(decoded.TipoUsuario !== 'J' && decoded.TipoUsuario !== 'C') return res.status(403).json({ message: "Forbidden. Cashiers and Clients only." });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.sign = async (data) => {
    try{
        const token = jwt.sign(data, privateKey, { algorithm: 'HS256', expiresIn: '1h' });
        return [true, token];
    }
    catch(err){
        return [false, 'Something went wrong while signing token...']
    }
}

module.exports = controller