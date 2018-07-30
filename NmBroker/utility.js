
var config = require('./config.json');
var azure = require('azure-sb');
var _ = require("underscore");
//var azure = require('azure-sb');


function SendMessageOnServiceBus(message, queueName, context) {
    return new Promise((resolve, reject) => {
        try {
            // context.log("Sending MSG");

            context.log("Connection Establishing " + config.ServiceBus.connectionString);
            var serviceBusService = azure.createServiceBusService(config.ServiceBus.connectionString);
            context.log("Sending Message on  " + queueName);
            serviceBusService.sendQueueMessage(queueName, message, function (error) {
                if (error)
                    reject({ StatusCode: "CP_1006", StatusMsg: error });
                else
                    resolve({ StatusCode: "CP_1000", StatusMsg: "SUCCESS" });

            });

        }
        catch (error) {

            throw ({ StatusCode: "CP_1005", StatusMsg: error });
        }



    });
}
function getChannelName(filterParam,context) {
    return new Promise((resolve, reject) => {
        //  context.log("varNMRegistrationID"+varNMRegistrationID);
        context.log("inputConfigDocument"+filterParam);
        context.log("ChannelDistributor"+JSON.stringify(config.ChannelDistributor));

        try {
        var filtercond = "{";
        filterParam.forEach(function myFunction(item, index) {
            if (filterParam.length - 1 > index)
                filtercond = filtercond + "\""+ item.key + "\":\"" + item.value + "\",";
            else
                filtercond = filtercond +"\""+ item.key + "\":\"" + item.value+"\"";
        }
        );
        filtercond = filtercond + "}";
        var pp=JSON.parse(filtercond);
        context.log("filtercond"+JSON.stringify(pp));

       
        var filteredConfigDocument = _.where(config.ChannelDistributor,pp);
        context.log("GGGG"+JSON.stringify(filteredConfigDocument));
        if (filteredConfigDocument != null && filteredConfigDocument != undefined && filteredConfigDocument.length > 0)

            resolve(filteredConfigDocument[0].queueName);
        else
            reject({ StatusCode: "CP_1005", StatusMsg: "Quename Not Found"+filterParam });
    }
    catch (error) {

        throw ({ StatusCode: "CP_1005", StatusMsg: error });
    }
    });
    
}

module.exports = {
    sendMessage: SendMessageOnServiceBus,
    getChannelName:getChannelName

};
