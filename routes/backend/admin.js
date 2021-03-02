'use strict';

const responseCodes =  require('./../../helpers/response-codes');
const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const express = require('express');
const router = express.Router();
const _ = require('underscore');
const adminHandler = require('./../../model_handlers/backend/admin-handler');

router.post('/create', function (req, res) {
	let requestParam = JSON.parse(req.body.fields);
	adminHandler.create(requestParam, req, function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});


router.get('/get',function (req, res) {
	adminHandler.get(req,function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});


router.post('/action', function (req, res) {
  adminHandler.action(req.body,function (error, response) {
    if (error) {
      jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
      return;
    }
    jsonResponse(res, responseCodes.OK, errors.noError(), response);
  });
});


router.post('/update', function (req, res) {
	let requestParam = JSON.parse(req.body.fields);
	adminHandler.update(requestParam, req, function (error, response) {
		if (error) {
			jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
			return;
		}
		jsonResponse(res, responseCodes.OK, errors.noError(), response);
	});
});


module.exports = router;