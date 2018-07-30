module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');


    context.res = {
        statusCode: "200",
        status: "Success"
    };
    context.bindings.outputSbMsg = req.body;

    context.done();
};