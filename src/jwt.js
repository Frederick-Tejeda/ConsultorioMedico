const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_KEY;

const controller = {}

controller.verify = async function(req, res, next){
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = await jwt.verify(token.split(" ")[1], privateKey);
        // console.log({ decoded });
        next();
    }catch(err){
        return res.status(500).json({ message: "Invalid token" })
    }
}

controller.sign = async ({ id }) => {
    try{
        const token = jwt.sign({ data: id }, privateKey, { algorithm: 'HS256', expiresIn: '1h' });
        return [true, token];
    }
    catch(err){
        return [false, 'Something went wrong while signing token...']
    }
}

module.exports = controller