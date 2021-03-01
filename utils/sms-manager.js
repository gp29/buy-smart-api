const config = require('./../config');
const twilio = require('twilio');
const client = new twilio(config.twilio.accountSid, config.twilio.authToken);

const sendSMS = (requestParam, done) => {
    console.log("sendSMS");
    console.log(requestParam);
    client.messages.create({
        body: requestParam.message,
        to: `${requestParam.mobile_country_code}${requestParam.mobile}`, // Text this number
        from: config.twilio.mobileNo // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
    return;
};

module.exports = {
    sendSMS
};