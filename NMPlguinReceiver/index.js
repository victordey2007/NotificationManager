var utility = require('./utility.js');

module.exports = function (context, mySbMsg, inputBlob) {

    context.log(JSON.stringify(mySbMsg));
    utility.validateRegistrationID(mySbMsg.NMMessage.NMHeader.NMRegistrationID, inputBlob).then((resolve) => {
        var app1=JSON.parse(resolve);
        var brokerRequest = [];
        brokerRequest.push({
            "key": "key1",
            "value": mySbMsg.NMMessage.NMHeader.NMRegistrationID
        });
        brokerRequest.push({
            "key": "key2",
            "value": app1.VendorName
        });
        var app = { "Body": mySbMsg, "FilterParams": brokerRequest };
        context.bindings.outputSbMsg = app;
        context.log("app" + JSON.stringify(app));
        context.done();

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