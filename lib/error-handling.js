var Http = require('http'),
    Cluster = require('cluster'),
    Hoek = require('hoek'),
    Config = require('./config');

var internals = {};

internals.errorMismatch = function (error) {

    if (error.statusCode && error.output.statusCode && (error.statusCode !== error.output.statusCode)) {
        return true;
    }

    return false;
};

internals.respondWithJson = function (request) {

    var headers = request.headers || {},
        path = request.path,
        contentType = headers['content-type'] || '';

    if (contentType.search('application/json') > -1 ||
        contentType.search('application/x-www-form-urlencoded') > -1 ||
        path.search(/^\/api/) > -1 ||
        path.search(/^\/docs/) > -1) {

        return true;
    }
};

internals.responseHandler = function (server) {

    server.ext('onPreResponse', function (request, reply) {

        var response = request.response;

        if (!response.isBoom) {
            return reply();
        }

        var error = response;

        console.error(error.message, request.path);
        console.debug(error.stack);

        if (internals.errorMismatch(error)) {

            // Boom unintelligently wraps any error in a 500.
            // Attempt to make that better.
            error.output.statusCode = error.statusCode;
            error.output.payload.statusCode = error.statusCode;
            error.output.payload.message = error.message;
            error.output.payload.error = Http.STATUS_CODES[error.statusCode];

            if (error.codes) {
                error.output.payload.codes = error.codes;
            }

            if (error.name) {
                error.output.payload.error = error.name;
            }
        }

        var respondWithJson = internals.respondWithJson(request);

        if (respondWithJson || !reply.view) {

            // Api paths can just return unrendered.
            return reply();
        }

        // Replace error with friendly HTML
        var defaults = {
            statusCode: 500,
            error: Http.STATUS_CODES[500],
            message: 'An error has occurred'
        };

        var context = Hoek.applyToDefaults(defaults, error.output.payload || {});

        if (context.statusCode === 404) {
            context.message = 'Page not found.';
            context.path = request.path;
        }

        var settings = Config.views;

        reply.view('error', context, {
            path: settings.path,
            layout: false
        });
    });
};

internals.onError = function (server, err) {

    function restartServer(killtimer) {
        // Let the master know we're dead.  This will trigger a
        // 'disconnect' in the cluster master, and then it will fork
        // a new worker.
        if (Cluster.isWorker) {
            Cluster.worker.disconnect();
        } else {
            server.start(function () {
                server.log(['error', 'serverRestart']);
                clearTimeout(killtimer);
            });
        }
    }

    function stopServer(done) {
        server.log(['error', 'serverStopping']);
        server.stop({
            timeout: 2 * 1000
        }, function () {
            server.log(['error', 'serverStop']);
            done();
        });
    }

    // Safely bring down the server and either restart, or
    // trigger a cluster disconnect.
    try {

        // make sure we close down within 30 seconds
        var killtimer = setTimeout(function () {
            process.exit(1);
        }, 30000);

        // But don't keep the process open just for that!
        killtimer.unref();

        // stop taking new requests.
        if (server._started) {
            stopServer(function () {
                if (Config.onError === 'restart') {
                    restartServer(killtimer);
                } else {
                    process.exit(1);
                }
            });
        }

    } catch (er2) {

        // oh well, not much we can do at this point.
        console.error('Error sending 500!', er2.stack);
    }
};

internals.internalError = function (server) {

    // Handle internalError events, restart server if necessary
    server.on('internalError', function (request, err) {
        server.log(['error', 'internalError'], err);
        if (err.domainThrown) {
            internals.onError(server, err);
        }
    });
};

internals.uncaughtException = function (server) {

    // Handle uncaughtException events, attempt restart...
    process.once('uncaughtException', function (err) {
        server.log(['error', 'uncaughtException'], err);
        internals.onError(server, err);
    });
};

exports.init = function (server, options, next) {

    internals.internalError(server);
    internals.uncaughtException(server);
    internals.responseHandler(server);

    next();
};
