const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/buysmart');
const dbConnection = mongoose.connection;
