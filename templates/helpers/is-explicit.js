var Handlebars = require('handlebars');

module.exports = function (explicit) {
    var html = '';
    if(explicit) {
      html = '<span class="glyphicon glyphicon-warning-sign"></span>';
    }
    return new Handlebars.SafeString(html);
};
