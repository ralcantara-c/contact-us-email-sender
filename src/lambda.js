'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const ContactUsMailClass = require('./contact-us-mail.js');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const config = require('./config/config');

module.exports.handler = async (event, context, callback) => {
    let params = event;
    let test_arg = process.argv[2];

    if ( typeof test_arg !== 'undefined' && test_arg !== null && test_arg){
        params = config.getTest();
    }

    const snsconfig = config.getSNSConfig();

    let SendContactUsMail = new ContactUsMailClass(sns, dynamodb, snsconfig);
    let response = await SendContactUsMail.SendContactUsMail(params);

    return response;
};