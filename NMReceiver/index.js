var uniqid = require('uniqid');
var config = require('./config.json');
var decrypt = require('./decrypt.js');
var utility = require('./utility.js');

module.exports = function (context, mySbMsg, inputBlob) {
   //// var inputMSgParsed = JSON.parse(mySbMsg);
   // context.log(JSON.stringify(inputMSgParsed));
    var document = "";
    var contectdataParse = "";
    decrypt.decrypt(config.Decryption.key, mySbMsg).then((resolve) => {
        contectdataParse = JSON.parse(resolve.decryptMessage);
        context.log("Msg Decrypted Successfully"+resolve.decryptMessage);
        return utility.validateRegistrationID(contectdataParse.NMHeader.NMRegistrationID, inputBlob);
    }).then((varRegResolve) => {

        context.log("Validated RegId successfully");
        var dateObj = new Date();
        var uniqueid = uniqid();
        document = {
            "NMID": uniqueid,
            "Registration_ID": contectdataParse.NMHeader.NMRegistrationID,
            "NMMessage": contectdataParse

        };
        return varRegResolve;
    }).then((varRegResolve) => {
        utility.PrepareAndSendMessage(document, varRegResolve, context).then((statusMsg) => {
           if(statusMsg=="SUCCESS")
           {
            context.bindings.outputDocument = JSON.stringify(document);
            context.done();
           }
           context.log("SUCCESS");
        }).catch((err) => {
            context.log("ERROR");
            context.done("ERROR");
        });

    }).catch((err) => {
        if (err.StatusCode == "1001") {
            context.log("Retrying to PROCESS " + err);
            context.done("ERROR");
        }
        else {
            context.bindings.outputSbMsg = mySbMsg;
            context.log("ERROR: " + JSON.stringify(err));
            context.done();

        }
    });
};
