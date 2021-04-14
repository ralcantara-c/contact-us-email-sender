'use strict';

const crypto = require('crypto');

class ContactUsMailClass {
    constructor(sns, dynamodb, configuration, sqs) {
        this.sns = sns;
        this.sqs = sqs;
        this.dynamodb = dynamodb;
        this.configuration = configuration;
        this.name = 'contact-us-email-sender';
    }

    async SendContactUsMail(event) {
        console.log(`Starting ${this.name}`)
        console.log(`NodeJS Version: ${process.version}`);

        let date = new Date();
        let now = date.toISOString();
        let code = 200;
        let message = 'OK';
        

        event.datetime_added = now;

        let sendToSQSResponse = await this.sendToSQS(this.sqs, event, this.configuration, this.dynamodb);

          if(!sendToSQSResponse) {
            code = 400;
            message = "Failed";
            return this.createResponse(code, message, event);
        }

        
        let publishToSNSResponse = await this.publishToSNS(this.sns, this.configuration, event);

         if(!publishToSNSResponse) {
            code = 400;
            message = "Failed";
            return this.createResponse(code, message, event);
        }

        return this.createResponse(code, message, event);
    }

    createResponse(statusCode, message, body) {
        return {
            "statusCode": statusCode,
            "message": message || "",
            "body": body
        }
    }

    async saveToDynamoDB(dynamodb, event) {

        let params = {
            TableName: 'email_receipt',
            Item: event
        }

        let saveToDBResponse = await dynamodb.put(params).promise().then(() => {
            console.log('Sent to Dynamo DB');
            return true;
        }).catch((e) => {
            console.log(`An error has occured: ${e.stack}`);
            return false;
        });

        return saveToDBResponse;
    }

    async publishToSNS(sns, configuration, event) {
        let success = true;
        let message = `Hi my name is ${event.firstname} ${event.lastname}, ${event.message}`;
        // Create publish parameters
        let params = {
            Message: message,
            Subject: `Contact US - ${event.email}`,
            TopicArn: `${configuration.sns.topicArn}`
        };

        let publishSNSResponse = await sns.publish(params).promise().then((data) => {
            console.log(`Message: Email ${event.email} is sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
            return {success: true, data: data};
        }).catch((error) => {
            console.log("An error has occured", error.stack);
            return {success: true, data: error};
        });

        success = publishSNSResponse.success;

        return success;
    }

    async sendToSQS(sqs, event, configuration, dynamodb) {
        let success = true;
        const queueURL = "https://sqs.us-west-2.amazonaws.com/689649163853/ContactUsQueue.fifo"

        var params = {
            // Remove DelaySeconds parameter and value for FIFO queues
            // DelaySeconds: 1,
            MessageAttributes: {
                "firstname": {
                    DataType: "String",
                    StringValue: event.firstname
                },
                "lastname": {
                    DataType: "String",
                    StringValue: event.firstname
                },
                "email": {
                    DataType: "String",
                    StringValue: event.email
                },
                "message": {
                    DataType: "String",
                    StringValue: event.message
                },
                "datetime_added": {
                    DataType: "String",
                    StringValue: event.datetime_added
                }
            },
            MessageBody: "Hi {{receipient}}, Thank you for contacting us. This is a confirmaton that we have received your message. Thank you",
            MessageDeduplicationId: event.email,  // Required for FIFO queues
            MessageGroupId: "Group1",  // Required for FIFO queues
            QueueUrl: configuration.sqs.queueURL
        };

        let sendMessageResponse = await sqs.sendMessage(params).promise().then(data => {
            console.log(`Message sent successfully to SQS: ${configuration.sqs.queueURL}`);
            return {success: true, data: data};
        }).catch(err => {
            console.log("An error has occured while sending message to SQS:", err);
            return {success: false, error: err};
        });


        if (sendMessageResponse.success) {
            let saveToDBResponse = await this.saveToDynamoDB(dynamodb, event);
            success = saveToDBResponse;
        }

        return success;
    }

}

module.exports = ContactUsMailClass;