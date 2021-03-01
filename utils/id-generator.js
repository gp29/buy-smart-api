const rightpad = require('right-pad');

const moment = require('moment');
const query = require('./../utils/query-creator');
const dbConstants = require('./../constants/db-constants');
const logger = require('./../utils/logger');
const errors = require('./../utils/dz-errors');

const formatString = (string) => {
  let stringPrefix = string.substr(0, 3);
  let stringPostfix = string.slice(-3);
  return rightpad(stringPrefix, (string.length - 3), '*')+stringPostfix;
};

const randomStr = () => {
  let length = 3;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const generateInviteCode = (length) => {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const generateRandom = (label) => {
  let generatedId = '';
  generatedId = label+`${moment().unix()}${Math.floor((Math.random() * 99) + 11)}`;
  return generatedId;
};

const generateId = (schema, id, label, done) => {
    done(null, generateRandom(label));
};

module.exports = {
  formatString,
  randomStr,
    generateId,
    generateRandom,
    generateInviteCode,
};