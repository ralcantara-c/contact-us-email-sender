'use strict';

const crypto = require('crypto');

class ContactUsMailClass {
    constructor(sns, dynamodb, snsconfig) {
        this.sns = sns;
        this.dynamodb = dynamodb;
        this.snsconfig = snsconfig;
        this.name = 'contact-us-email-sender';
        this.correlationId = crypto.randomBytes(16).toString('hex');
    }

    async SendContactUsMail(event) {
        console.log(`Starting ${this.name}`)

        console.log(`NodeJS Version: ${process.version}`);

        let date = new Date();
        let now = date.toISOString();
        let code = 200;
        let message = 'OK';

        let params = {
                'firstname': event.firstname,
                'lastname': event.lastname,
                'email': event.email,
                'message': event.message,
                'datetime_added': now
        };

        let publishToSNSResponse = await this.publishToSNS(this.sns, this.snsconfig, this.dynamodb, params);

         if(!publishToSNSResponse) {
            code = 400;
            message = "Failed";
            return this.createResponse(code, message, params);
        }

        return this.createResponse(code, message, params);
    }

    createResponse(statusCode, message, body) {
        return {
            "statusCode": statusCode,
            "message": message || "",
            "body": body
        }
    }

    async saveToDynamoDB(dynamodb, event){
        let success = true;

        let params = {
            TableName: 'email_receipt',
            Item: event
        }

        await dynamodb.put(params).promise().then(()=> {
            console.log('Sent to Dynamo DB');
        }).catch((e)=>{
            console.log(`An error has occured: ${e.stack}`);
            success = false;
        });

        return success;
    }

    async publishToSNS(sns, snsconfig, dynamodb, event){
        let success = true;
        let message = `Hi my name is ${event.firstname} ${event.lastname}, ${event.message}`;
        // Create publish parameters
        let params = {
            Message: message,
            Subject: `Contact US - ${event.email}`,
            TopicArn: `${snsconfig.topicArn}`
        };

        await sns.publish(params).promise().then((data) => {
            console.log(`Message: Email ${event.email} is sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch((error) => {
            console.log(error, error.stack);
            success = false;
        });

        if (success) {
            let saveToDBResponse = await this.saveToDynamoDB(dynamodb, event);
            success = saveToDBResponse;
        }
        
        return success;
    }

}

module.exports = ContactUsMailClass;