'use strict';

const responseCodes = require('./../../helpers/response-codes');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors-api');
const express = require('express');
const router = express.Router();
const productHandler = require('./../../model_handlers/api/product-handler');

router.get('/get-results', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.img_urls) {
            let response = await productHandler.getResults(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.get('/get-image-key', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.Img_url) {
            let response = await productHandler.getImageKey(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.get('/get-product-key', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.Product_Url) {
            let response = await productHandler.getProductKey(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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


router.get('/data-insert', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.Host && req.query.Product_Title && req.query.Product_Url && req.query.Img_url && req.query.SellPrice) {
            let response = await productHandler.dataInsert(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.post('/data-insert-post', async(req, res) => {
    req.body.code = 'EN';
    try {
        let response = await productHandler.dataInsertPost(req.body, req.body.code);
        jsonResponse(res, responseCodes.OK, errors.noError(), response);
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

router.post('/data-insert-android', async(req, res) => {
    req.body.code = 'EN';
    try {
        let response = await productHandler.dataInsertAndroid(req.body, req.body.code);
        jsonResponse(res, responseCodes.OK, errors.noError(), response);
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

router.get('/get-cache-results', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.Product_Url) {
            let response = await productHandler.getCacheResults(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.get('/feed', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id) {
            let response = await productHandler.feed(req.query, req.query.code);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

module.exports = router;