'use strict';

let params = {};

let lambda = require('./src/lambda');

async function handler (params){
    let event = params;
    let context = {};
    let callback = undefined;
    let response = await lambda.handler(event, context, callback);

    console.log(response);
}

handler(params);