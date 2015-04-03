/* jshint multistr:true */

var Fs = require('fs-extra'),
    Path = require('path'),
    Config = require('./config'),
    env = Config.env,
    logConfig = Config.log,
    internals = {};

internals.writeLog = function () {
    var logDir,
        logPath,
        log;

    if (!logConfig.path) return;

    logDir = logConfig.path;
    Fs.ensureDirSync(logDir);

    logPath = Path.join(logDir, 'server.log');
    log = Fs.createWriteStream(logPath, {
        flags: 'a'
    });

    console.onOutput(function (msg, lvl) {
        log.write(msg + '\n');
    });
};

internals.messages = function (tags, data, server) {

    if (tags.error) {

        if (tags.serverStopping) {
            console.warn('Server encountered an error is stopping...');
            return;
        }

        if (tags.serverStop) {
            console.warn('Server stopped');
            return;
        }

        if (tags.serverRestart) {
            console.warn('Server restarted');
            return;
        }

        if (tags.uncaughtException) {
            console.error('Exception: ' + data);
            return;
        }

        if (tags.internalError) {
            console.error('Internal Error: ' + data);
            return;
        }

        if (data) {
            console.error(data);
        }

        return;
    }

    if (tags.info && data) {

        var infoMessage;

        if (data instanceof Object) {

            if (data.message) {
                infoMessage = data.message;
            } else {
                infoMessage = JSON.stringify(data);
            }

        } else {

            infoMessage = data;
        }

        console.info(infoMessage);

        return;
    }

    if (tags.start && data) {

        // Startup & Shutdown messages
        if (env === 'production') {
            console.warn('Server started: ' + data.uri);
            process.on('SIGINT', function () {
                console.warn('Server has shut down');
                process.exit(0);
            });
        } else {
            console.info('#green{Server is running in %s...}\
                        \n#grey{Listening on} %s:%s\
                        \n#grey{Url configured as} %s\
                        \n#grey{Ctrl+C to shut down}',
                env, data.host, data.port, data.uri);

            // ensure that server exits correctly on Ctrl+C
            process.on('SIGINT', function () {
                console.warn(
                    '#red{Server has shutdown}\
                    \nServer was running for %d seconds',
                    Math.round(process.uptime())
                );
                process.exit(0);
            });
        }

        return;
    }
};

internals.logging = function (server) {

    // Pass good events to the messages function.
    server.pack.events.on('log', function (event, tags, data) {
        internals.messages(tags, event.data, event.server);
    });

    if (Config.env === 'production') {
        internals.writeLog();
    }
};

exports.init = function (server, options, next) {

    internals.logging(server);
    next();
};
