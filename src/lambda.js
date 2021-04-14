'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const ContactUsMailClass = require('./contact-us-mail.js');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const config = require('./config/config');
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

module.exports.handler = async (event, context, callback) => {
    let params = event;
    let test_arg = process.argv[2];

    if ( typeof test_arg !== 'undefined' && test_arg !== null && test_arg){
        params = config.getTest();
    }

    let configuration = {};
    configuration.sns = config.getSNSConfig();
    configuration.sqs = config.getSQSConfig();

    let SendContactUsMail = new ContactUsMailClass(sns, dynamodb, configuration, sqs);
    let response = await SendContactUsMail.SendContactUsMail(params);

    return response;
};