'use strict';

var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';

module.exports = {
    _saltLength: 16,

    _saltSet: '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',    

    encrypt: function(text) {
        return new Promise((resolve, reject) => {
            let cipher = crypto.createCipher(algorithm,password)
            let crypted = cipher.update(text,'utf8','hex')
            crypted += cipher.final('hex');
            
            resolve(crypted);
            return;
        })
    },

    decrypt: function(text) {
        return new Promise((resolve, reject) => {
            let decipher = crypto.createDecipher(algorithm,password)
            let dec = decipher.update(text,'hex','utf8')
            dec += decipher.final('utf8');
            
            resolve(dec);
            return;
        })
    },
};
