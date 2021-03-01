'use strict';
const xml = require('xml');
/*
 * Standardizes json responses from the server to client
 *
 * @param {Object} Express response object
 * @param {Int} Response status code
 * @param {Object} Any Error thrown that should be propagated to client
 * @param {Object, Array, Number, String} Any object that should be sent that can be serialized
 */
module.exports = function(res, status, error, payload) {
	res.set('Content-Type', 'text/xml');
    //res.send(xml(payload));
    res.send(payload);

};
