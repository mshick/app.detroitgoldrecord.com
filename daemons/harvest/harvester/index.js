var Vine = require('./vine'),
    Instagram = require('./instagram');

exports.createHarvester = function (options) {

    var opts = {
        verbose: options.verbose,
        host: options.host,
        endpoints: options.endpoints,
        auth: options.auth,
        settings: options.providerSettings
    };

    if (options.provider === 'vine') {
        return new Vine(opts);
    }

    if (options.provider === 'instagram') {
        return new Instagram(opts);
    }
};
