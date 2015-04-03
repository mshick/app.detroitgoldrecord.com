var Hoek = require('hoek'),
    Config = require('../config');

exports.init = function (server, options, next) {

    var settings = Config.views;

    server.views({
        engines: {
            hbs: require('handlebars')
        },
        path: settings.path,
        partialsPath: settings.partialsPath,
        helpersPath: settings.helpersPath,
        layout: settings.layout
    });

    server.ext('onPreResponse', function (request, reply) {
        if (request.response.variety === 'view') {
            var context = request.response.source.context,
                defaultContext = {};

            defaultContext = {
                identity: Config.identity,
                env: Config.env,
                adminPages: [{
                    path: '/admin',
                    title: 'Dashboard',
                }, {
                    path: '/admin/artifacts',
                    title: 'Artifacts'
                }, {
                    path: '/admin/harvesting',
                    title: 'Harvesting'
                }]
            };

            context = Hoek.applyToDefaults(defaultContext, context);
            request.response.source.context = context;
        }

        reply();
    });

    next();
};
