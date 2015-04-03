var Moment = require('moment-timezone'),
    Handlebars = require('handlebars');

module.exports = function(context, block) {

    var frmt = block.hash.format || 'MMM Do, YYYY';
    var str = Moment.tz(context, 'America/New_York').format(frmt);
    return new Handlebars.SafeString(str);
};
