'use strict';
// todo: modularize
module.exports.getSNSConfig = () => {
    return {
        topicArn: 'arn:aws:sns:us-west-2:689649163853:dynamodb'
    };
};


module.exports.getTest = () => {
    return {firstname: 'Reymbrant', lastname: 'Alcantara', email: 'ralcantara@justfab.com', message: 'testmessage101'}
}

