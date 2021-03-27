'use strict';

let params = {};

let lambda = require('./src/lambda');

exports.handler = async (params) => {
    let event = params;
    let context = {};
    let callback = undefined;
    let response = await lambda.handler(event, context, callback);

    console.log(response);
}