const cryptoJs = require('crypto-js');
const controller = {}

controller.Encrypt = (text) => {
    try{
        const encryptedText = cryptoJs.AES.encrypt(text, process.env.CRYPTING_KEY).toString();
        return ["OK", encryptedText];
    }catch(err){
        if(process.env.STAGE === "DEVELOPMENT") return ["ERR", `Error when encrypting: ${err}`];
        else return ["ERR", 'Something went wrong...'];
    }
}

controller.Decrypt = (text) => {
    try{
        let decrypted = []
        const decryptedText = cryptoJs.AES.decrypt(text, process.env.CRYPTING_KEY).toString(cryptoJs.enc.Utf8)
        return ["OK", decryptedText];
    }catch(err){
        if(process.env.STAGE === "DEVELOPMENT") return ["ERR", `Error when decrypting: ${err}`];
        else return ["ERR", 'Something went wrong...'];
    }
}

module.exports = controller