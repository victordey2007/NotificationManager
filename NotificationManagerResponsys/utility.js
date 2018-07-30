var request = require('request');
var username = "web-services@jetblue";
var password = "af349Ptgafgk";

function SendToResponsys(args, context) {
    return new Promise((resolve, reject) => {
       
        request({
            url: "https://qa-rsys.api.responsys.net/ts-rsys-ws/rest/trigger/campaign",
            method: "POST",
            json: true,
            headers: {
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            },// <--Very important!!!
            body: args
        }, function (error, response, body) {
                if(error)
                    reject(error);
                else
                    resolve(response.body);
                   


        });
    });
}

module.exports = {
    SendToResponsys: SendToResponsys
};

