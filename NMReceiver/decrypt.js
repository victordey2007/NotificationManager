const crypto = require("crypto");
var decrypt=(key,data)=>{
    return new Promise((resolve,reject)=>{
        var decipher = crypto.createDecipher('aes-128-ecb', key);
        var des=decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
        resolve({
            decryptMessage:des
        });
    })
   
}


module.exports = {
    decrypt:decrypt
};