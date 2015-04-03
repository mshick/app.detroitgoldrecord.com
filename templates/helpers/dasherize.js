var Handlebars = require('handlebars'),
    string = require('utilities').string;

module.exports = function (str) {
    str = string.dasherize(str);
    return new Handlebars.SafeString(str);
};
