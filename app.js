'use strict';

// var moment = require('moment-timezone');
// console.log(moment(new Date()).tz("Australia/Sydney").format());

//configurations
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');
const jsonResponse = require('./utils/json-response');
const config = require('./config');
const errors = require('./utils/dz-errors');
const cors = require('cors');
const cron = require('node-cron');
const request = require('request');


//routes
const routes = require('./routes/index');
const authBackend = require('./routes/backend/auth');
const admin = require('./routes/backend/admin');
const product = require('./routes/backend/product');
const banner = require('./routes/backend/banner');
const feed = require('./routes/backend/feed');
const lottie = require('./routes/backend/lottie');

// FOR API
const authAPI = require('./routes/api/auth');
const productAPI = require('./routes/api/product');
const bannerAPI = require('./routes/api/banner');

//other configurations
const passport = require('passport');
const favicon = require('serve-favicon');
const multiparty = require('connect-multiparty');
const upload = require('express-fileupload');
const multipartyMiddleWare = multiparty();

//express configurations
const app = express();
app.use(favicon(path.join(__dirname, './public/img', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '100mb', parameterLimit: 1000000}));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(multipartyMiddleWare);

// import routes
app.use('/',routes);
app.use('/backend/auth', authBackend);
app.use('/backend/user', admin);
app.use('/backend/product', product);
app.use('/backend/banner', banner);
app.use('/backend/feed', feed);
app.use('/backend/lottie', lottie);

// FOR API
app.use('/api/auth', authAPI);
app.use('/api/product', productAPI);
app.use('/api/banner', bannerAPI);

app.use(upload());

var swaggerUi = require("swagger-ui-express"),
swaggerDocument = require("./swagger.json");

app.use("/api-swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// catch 404 and forward to error handler
app.use((req, res) => {
	logger('Error: No route found or Wrong method name');
	jsonResponse(res, errors.resourceNotFound(true), null);
});

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
	app.use((err, req, res) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
			error: err
		});
	});
}

// production error handler
// no stack traces leaked to user
app.use((err, req, res) => {
	res.status(err.status || 500);
	res.render('error', {
	message: err.message,
		error: {}
	});
});

module.exports = app;




