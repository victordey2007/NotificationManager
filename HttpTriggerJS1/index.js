module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log(req);

context.done();
};