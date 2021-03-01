const randomString = require('random-string');
const generateString = (length, numeric, letters, special) => {
    let generatedString = randomString({
        length: length,
        numeric: numeric,
        letters: letters,
        special: special,
    });
    return generatedString;
};

module.exports = {
    generateString,
};