'use strict';
// todo: modularize
module.exports.getSNSConfig = () => {
    return {
        topicArn: 'arn:aws:sns:us-west-2:689649163853:ContactUsTopic'
    };
};


module.exports.getTest = () => {
    return {firstname: 'Reymbrant', lastname: 'Alcantara', email: 'ralcantara@justfab.com', message: 'testmessage101'}
}

module.exports.getSQSConfig = () => {
    return {
        queueURL: 'https://sqs.us-west-2.amazonaws.com/689649163853/ContactUsQueue.fifo'
    };
};
