
var _ = require("underscore");
var config = require('./config.json');
var azure = require('azure-sb');
//var azure = require('azure-sb');
function validateRegistrationID(varNMRegistrationID, inputConfigDocument) {
    return new Promise((resolve, reject) => {
        try {
            var documentConfig = JSON.stringify(inputConfigDocument);
            var documentConfigParse = JSON.parse(documentConfig);

            var filteredConfigDocument = _.where(documentConfigParse.Configs.Config, { NMRegistrationID: varNMRegistrationID });
            if (filteredConfigDocument != null && filteredConfigDocument != undefined && filteredConfigDocument.length > 0)
                resolve(JSON.stringify(filteredConfigDocument[0]));
            else
                reject({ StatusCode: "CP_1012", StatusMsg: "RegID_NOT_FOUND" });
        }
        catch (error) {
            throw ({ StatusCode: "CP_1011", StatusMsg: error });
        }

    });
}
function getQueueConnectionString(queueName, inputConfigDocument, context) {
    return new Promise((resolve, reject) => {
        try {
            var documentConfig = JSON.stringify(inputConfigDocument);
            var documentConfigParse = JSON.parse(documentConfig);

            var filteredConfigDocument = _.where(documentConfigParse, { queueName: queueName });

            if (filteredConfigDocument != null && filteredConfigDocument != undefined && filteredConfigDocument.length > 0)

                resolve(JSON.stringify(filteredConfigDocument[0]));
            else {
                context.log("error as nul");
                reject({ StatusCode: "CP_1012", StatusMsg: "RegID_NOT_FOUND" });
            }
        }
        catch (error) {
            context.log("catch err");
            throw ({ StatusCode: "CP_1011", StatusMsg: error });
        }


    });
}





function PrepareAndSendMessageToPlugin(input, ConfigDocument, context) {
    return new Promise((resolve, reject) => {
        try {
            var documentConfigParsed = JSON.parse(ConfigDocument);
            var inputDocument = JSON.parse(JSON.stringify(input));
            context.log("Parsed");
            if (typeof inputDocument.NMMessage.NMHeader.DeliveryChannels.Email !== "undefined" ||
                typeof inputDocument.NMMessage.NMHeader.DeliveryChannels.SMS !== "undefined")
            // does not exist
            {
                context.log("loop");
                context.bindings.outputSbMsgSucces = [];
                // JSON.stringify(statusMsg);
                _.each(documentConfigParsed.Result, function (resultv, key) {
                    var brokerRequest = [];

                    if ((resultv.ChannelType == "Email" && typeof inputDocument.NMMessage.NMHeader.DeliveryChannels.Email != "undefined") || (resultv.ChannelType == "SMS" && typeof inputDocument.NMMessage.NMHeader.DeliveryChannels.SMS != "undefined")) {

                        brokerRequest.push({
                            "key": "key1",
                            "value":inputDocument.NMMessage.NMHeader.NMRegistrationID
                            });

                         brokerRequest.push({
                            "key": "key2",
                            "value":"Plugin"
                            });
                             brokerRequest.push({
                            "key": "key3",
                            "value":resultv.ChannelType
                            });

                        
                       

                    
                    context.bindings.outputSbMsgSucces.push({"Body":inputDocument,
                    "FilterParams":brokerRequest});
                    context.log("PREPARE SUCCESS");
					}
                   
                });
                resolve("SUCCESS");
            }
            else
                reject({ StatusCode: "CP_1015",StatusMsg: "Channel_Not_Found" });
        }
        catch (error) {
            throw ({ StatusCode: "CP_1015", StatusMsg: error });
        }

    });

}
function SendMessageOnServiceBus(message, queueName, context) {
    return new Promise((resolve, reject) => {
        try {
            context.log("Sending MSG");
            getQueueConnectionString(queueName, config.ServiceBusconfig, context).then((result) => {
                var resultParsed = JSON.parse(result);
                context.log("MSG Configuration " + JSON.stringify(result));
                var serviceBusService = azure.createServiceBusService(resultParsed.connectionString);

                serviceBusService.sendQueueMessage(queueName, message, function (error) {
                    if (error) {
                        reject({ StatusCode: "CP_1006", StatusMsg: error });
                    }
                });
                resolve({ StatusCode: "CP_1000", StatusMsg: "SUCCESS" });
            }).catch((error) => {
                context.log("ERRRRGHHH");
                reject(error);
            });

        }
        catch (error) {
            context.log("ERRRRRRRR");
            throw ({ StatusCode: "CP_1005", StatusMsg: error });
        }



    });
}


module.exports = {
    validateRegistrationID: validateRegistrationID,
    PrepareAndSendMessage: PrepareAndSendMessageToPlugin,
    sendMessage: SendMessageOnServiceBus,

};

