var Hoek = require('hoek'),
    DbServer = require('./db-server');

var defaults = {
    manifest: './manifest.json',
    data: './data',
    dbOptions: {
        keyEncoding: 'utf8',
        valueEncoding: 'json'
    }
};

exports.start = function (options) {
    var dbServer,
        settings,
        server;

    Hoek.assert(options.port && options.host, 'Port and host are required!');

    // TODO: clean up so this isn't needed
    delete options.manifest;

    settings = Hoek.applyToDefaults(defaults, options);

    dbServer = new DbServer(settings);

    server = dbServer.createServer(settings.port, settings.host, settings);

    server.on('listening', function () {
        console.warn('LevelDB server started...');
    });

    server.on('close', function () {
        console.warn('LevelDB server stopped');
    });

    server.on('error', function (err) {
        console.error(err);
    });

    process.on('SIGINT', function () {
        if (server._handle) {
            server.close(process.exit);
        } else {
            process.exit();
        }
    });
};
