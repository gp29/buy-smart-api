'use strict';

const responseCodes = require('./../../helpers/response-codes');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors-api');
const express = require('express');
const router = express.Router();
const reportHandler = require('./../../model_handlers/api/report-handler');

router.get('/category-list', async(req, res) => {
    req.query.code = 'EN';
    try {
        let response = await reportHandler.categoryList(req, req.query.code);
        jsonResponse(res, responseCodes.OK, errors.noError(), response);
    } catch (error) {
        try {
            jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
            return;
        } catch (error) {
            jsonResponse(res, responseCodes.InternalServer, errors.internalServer(true, req.query.code), null);
            return;
        }
    }
});

router.post('/user-send-report', async(req, res) => {
    req.body.code = 'EN';
    try {
        if (req.body.user_id && req.body.report_category_id && req.body.message && req.body.result_id) {
            let response = await reportHandler.sendReport(req.body);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.body.code), null);
            return;
        }
    } catch (error) {
        try {
            jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
            return;
        } catch (error) {
            jsonResponse(res, responseCodes.InternalServer, errors.internalServer(true, req.body.code), null);
            return;
        }
    }
});


module.exports = router;