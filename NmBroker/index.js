var utility = require('./utility.js');
module.exports = function (context, mySbMsg, inputBlob) {
    context.log(JSON.stringify(mySbMsg.FilterParams));
    utility.getChannelName(mySbMsg.FilterParams, context).then((resolveChannel) => {
        return resolveChannel;
    }).then((resolveChannel) => {
        utility.sendMessage(JSON.stringify(mySbMsg.Body), resolveChannel, context).then((resolve) => {
            if (resolve.StatusMsg == "SUCCESS") {
                context.log("Status" + JSON.stringify(resolve));
                context.done();
            }
            else {
                context.log("Not Success");
                context.bindings.outputSbMsg = mySbMsg;
                context.done();

            }

        }).catch((err) => {
            if (err.StatusCode == "1001") {
                context.log("Retrying to PROCESS " + err);
                context.done("ERROR");
            }
            else {
                context.bindings.outputSbMsg = mySbMsg;
                context.log("ERROR In: " + JSON.stringify(err));


            }
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