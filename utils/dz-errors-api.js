'use strict';

const _ = require('underscore');
const responseCodes = require('./../helpers/response-codes');
const labels = require('./../utils/labels.json');
const config = require('../config');

function DZError(message, code, name = 'DZError') {
	this.name = name;
	this.message = message || 'Default Message';
	this.code = code;
	this.stack = (new Error()).stack;
}

DZError.prototype = Object.create(Error.prototype);
DZError.prototype.constructor = DZError;

module.exports = {
	missingParameters: function(formatForWire, language){
		const error = new DZError(
			labels.LBL_MISSING_PARAMETERS['MESSAGE'][language || config.default_language],
			responseCodes.BadRequest,
			labels.LBL_MISSING_PARAMETERS['NAME'][language || config.default_language]
		);
		return formatForWire ? this.formatErrorForWire(error) : error;
	},
	internalServer: function(formatForWire, language){
		const error = new DZError(
			labels.LBL_INTERNAL_SERVER['MESSAGE'][language || config.default_language],
			responseCodes.InternalServer,
			labels.LBL_INTERNAL_SERVER['NAME'][language || config.default_language]
		);
		return formatForWire ? this.formatErrorForWire(error) : error;
	},
	userNotFound: function(formatForWire, language){
		const error = new DZError(
			labels.LBL_USER_NOT_FOUND['MESSAGE'][language || config.default_language],
			responseCodes.ResourceNotFound, 
			labels.LBL_USER_NOT_FOUND['NAME'][language || config.default_language],
		);
		return formatForWire ? this.formatErrorForWire(error) : error;
	},
	noError: function(){
		return null;
	},
	errorWithMessage: function(error){
		return new DZError((_.has(error, 'message') ? error.message : ''));
	},
	formatErrorForWire: function(DZError){
		return _.omit(DZError, 'stack');
	},
	customError: function(message, code, name, formatForWire){
		const error = new DZError(message, code, name);
		return formatForWire ? this.formatErrorForWire(error) : error;
	}
};
