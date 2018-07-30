var utility = require('./utility.js');
module.exports = function (context, mySbMsg) {
    context.log("Initiated Sending to Responsys" + JSON.stringify(mySbMsg));
    utility.SendToResponsys(mySbMsg, context).then((resolve) => {
        var data = {
             mySbMsg,
            "output": resolve
        };
        context.bindings.outputDocument=JSON.stringify(data);
        context.log("resolve" + JSON.stringify(data));
        context.done();

    }
    ).
    catch((err) => {
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
