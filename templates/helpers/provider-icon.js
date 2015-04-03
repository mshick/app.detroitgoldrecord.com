var Handlebars = require('handlebars');

module.exports = function (provider) {
    if (!provider) return;

    var html = '';
    if (provider === 'instagram') {
        html = '<i class="fa fa-instagram fa-lg"></i>'
    }
    if (provider === 'vine') {
        html = '<i class="fa fa-vine fa-lg"></i>'
    }
    if (provider === 'wlkthewlk') {
        html = '<i class="fa fa-video-camera fa-lg"></i>'
    }
    return new Handlebars.SafeString(html);
};
