var Handlebars = require('handlebars');

module.exports = function (linkText, linkUrl) {

    var html = '';

    if (linkUrl) {
        html = '<a target="_new" href="' + linkUrl + '">' + linkText + '</a>';
    } else {
        html = '<span>' + linkText + '</span>';
    }

    return new Handlebars.SafeString(html);
};
