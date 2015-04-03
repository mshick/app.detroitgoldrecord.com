var Handlebars = require('handlebars');

module.exports = function (options) {
    // return options.fn(this);
    return new Handlebars.SafeString(options.fn(this));
};
