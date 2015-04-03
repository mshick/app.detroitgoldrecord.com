var Api = require('./api'),
    Pages = require('./pages'),
    Static = require('./static');

exports.api = Api;
exports.pages = Pages;

exports.init = function (server, options, next) {
    server.route(Api);
    server.route(Pages);
    server.route(Static);

    next();
};
