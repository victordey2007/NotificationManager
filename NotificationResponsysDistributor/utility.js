var _ = require("underscore");
function validateRegistrationID(varNMRegistrationID, inputConfigDocument) {
    return new Promise((resolve, reject) => {
        try {
            var documentConfig = JSON.stringify(inputConfigDocument);
            var documentConfigParse = JSON.parse(documentConfig);

            var filteredConfigDocument = _.where(documentConfigParse.Configs.Config, { NMRegistrationID: varNMRegistrationID });

            if (filteredConfigDocument != null && filteredConfigDocument != undefined && filteredConfigDocument.length > 0) {

                var filteredConfigDocument1 = _.where(filteredConfigDocument[0].Result, { ChannelType: "Email" });
                if (filteredConfigDocument1 != null && filteredConfigDocument1 != undefined && filteredConfigDocument1.length > 0)
                    resolve(JSON.stringify(filteredConfigDocument1[0]));
                else
                    reject({ StatusCode: "CP_1013", StatusMsg: "Channel_Not_Found" });
            }

            else
                reject({ StatusCode: "CP_1012", StatusMsg: "RegID_NOT_FOUND" });
        }
        catch (error) {
            throw ({ StatusCode: "CP_1011", StatusMsg: error });
        }

    });
}
function sendRequestToDistributor(input, inputconfigDoc, context) {

    return new Promise((resolve, reject) => {
	 try {
        var documentInputParse = JSON.parse(input);
        var configDoc = JSON.parse(inputconfigDoc);
         context.bindings.outputSbMsg=[];
        _.each(documentInputParse.NMMessage.NMHeader.DeliveryChannels.Email, function (email, key) {
           
            var args = {
                "transactionId": documentInputParse.NMID,
                "accountId": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.AccountID,
                "brandId": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.BrandID,
                "campaignType": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.CampaignType,
                "transactionDate": "",
                "langLocale": "",
                "priorityLevel": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.PriorityLevel,
                "test": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.Test,
                "campaign": {
                    "folderName": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.List.FolderName,
                    "objectName": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.List.ObjectName
                },
                "recipientData": {
                    "recipient": {
                        "listName": {
                            "folderName": "Operational_Emails",
                            "objectName": "OPERATIONAL_CONTACTS_LIST"
                        },
                        "emailAddress": email.Email,
                        "permissionStatus": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.EmailPermissionStatus,
                        "insertOnNoMatch": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.InsertOnNoMatch,
                        "updateOnMatch": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.UpdateOnMatch,
                        "matchColumnName1": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.MatchColumnName1,
                        "matchColumnName2": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.MatchColumnName2
                    },
                    "optionalData": [

                        {
                            "name": configDoc.ChannelDeliverySpecificConfig.ResponsysSetting.NMInteractionIDColumnName,
                            "value": documentInputParse.NMID
                        }
                    ]
                }

            };
            //context.log("HEELO"+JSON.stringify(documentInputParse.NMMessage.NMChannelMessage.KeyValuePairs));

            _.each(documentInputParse.NMMessage.NMChannelMessage.KeyValuePairs.KeyValue, function (keyValue, key) {
              
                var app = {
                    "name": keyValue.key,
                    "value": keyValue.value
                }
                args.recipientData.optionalData.push(app);
            });
            context.log(JSON.stringify("Responsys Request preapred succsessfully"));
            context.bindings.outputSbMsg.push(args);


        });
        resolve("SUCCESS");
		}
        catch (error) {
            throw ({ StatusCode: "CP_1022", StatusMsg: error });
        }
    });

}
module.exports = {
    sendRequestToDistributor: sendRequestToDistributor,
    validateRegistrationID: validateRegistrationID
};


