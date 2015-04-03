var Handlebars = require('handlebars');

module.exports = function (context) {
    var active = '';
    if(context === this.path) {
      active = 'active';
    }
    return new Handlebars.SafeString(active);
};
