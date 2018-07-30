
var utility = require('./utility.js');

module.exports = function (context, mySbMsg, inputBlob) {

    context.log(JSON.stringify(mySbMsg));
    var inputMSg = JSON.stringify(mySbMsg);
    utility.validateRegistrationID(mySbMsg.NMMessage.NMHeader.NMRegistrationID, inputBlob).then((resultv) => {
        return utility.sendRequestToDistributor(inputMSg, resultv, context);
    }).then((status) => {
        if (status = "SUCCESS")
            context.done();
    }).catch((err) => {
        if (err.StatusCode == "1001") {
            context.log("Retrying to PROCESS " + err);
            context.done("ERROR");
        }
        else {
            context.bindings.outputSbMsgError = mySbMsg;
            context.log("ERROR: " + JSON.stringify(err));
            context.done();

        }
    });
};