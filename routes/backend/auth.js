'use strict';

const responseCodes =  require('./../../helpers/response-codes');
const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const express = require('express');
const router = express.Router();
const _ = require('underscore');
const authHandler = require('./../../model_handlers/backend/auth-handler');

router.post('/login', function (req, res) {
	authHandler.login(req.body,function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});

router.post('/forgot', function (req, res) {
	authHandler.forgot(req.body,function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});

router.post('/reset', function (req, res) {
	authHandler.reset(req.body,function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});


module.exports = router;