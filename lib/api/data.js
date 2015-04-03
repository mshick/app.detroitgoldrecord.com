var Fs = require('fs'),
    Hoek = require('hoek'),
    Transform = require('stream').Transform,
    JSONStream = require('JSONStream'),
    Utils = require('utilities'),
    string = Utils.string,
    Models = require('../models'),
    Helpers = require('../helpers'),
    Config = require('../config'),
    Db = Helpers.Db,
    dbConfig = Config.multilevel;

var internals;

internals = {};

// NOTE: Commands assume a type is provided, and that is maps 1-to-1
//       to a model name.

internals.isSublevel = function (sublevel) {
    var sublevels = dbConfig.sublevels || {};
    return sublevels[sublevel];
};

internals.doDump = function (db) {
    var readStream,
        transform,
        stringify;

    stringify = JSONStream.stringify();

    transform = new Transform({
        objectMode: true
    });

    transform._transform = function (data, encoding, cb) {
        if (data && data.value) {
            this.push(data.value);
        }
        cb();
    };

    readStream = db.createReadStream();

    readStream.on('end', function () {
        db.close();
    });

    return readStream.pipe(transform).pipe(stringify);
};

internals.dumpLevelDB = function (sublevel, done) {
    var dbConnect,
        dbClient;

    dbConnect = new Db();
    dbClient = dbConnect.createClient(dbConfig.port, dbConfig.host, dbConfig);

    dbConnect.on('error', function (err) {
        done(err);
    });

    dbConnect.once('connect', function () {
        dbClient = dbClient.sublevel(sublevel);
        done(null, internals.doDump(dbClient));
    });
};

internals.dump = function (options, done) {

    options = options || {};

    var type = options.type;

    if (!type) {
        return done(new Error('No type provided'));
    }

    if (internals.isSublevel(type)) {

        internals.dumpLevelDB(type, done);

    } else {
        // Can't handle these yet...
        done();
    }
};

internals.ingest = function (readStream, options, done) {

    options = options || {};

    var type = options.type,
        parseJSON,
        Model,
        modelType,
        item,
        doneReading = false,
        processingCount = 0,
        recordCount = 0,
        insertCount = 0,
        errorCount = 0,
        generatedKeys = [],
        ticking,
        timer,
        maxTime = 10000, // 10 seconds
        result;

    modelType = string.capitalize(type);

    if (!type || !Models[modelType]) {
        return done(new Error('No type provided or type is invalid'));
    }

    Model = Models[modelType];

    function truncate(cb) {
        Model.remove({}, cb);
    }

    function saveResult(err, doc) {
        if (err) errorCount++;

        if (doc && doc.id) {
            insertCount++;
            generatedKeys.push(doc.id);
        }

        processingCount--;

        if (doneReading && processingCount === 0) {
            finished();
        }
    }

    function onData(data) {
        if (!data.type) {
            errorCount++;
            return;
        }
        item = null;
        if (data.type === type) {

            item = Model.create(data);
            if (item.isValid()) {
                defuse();
                processingCount++;
                item.save(saveResult);
                return;
            }
        }

        errorCount++;
    }

    function onRoot(root, count) {
        recordCount = count;
    }

    function onEnd(err) {
        doneReading = true;
        if (err) {
            readStream.destroy();
            finished(err);
        }
    }

    function defuse() {
        clearTimeout(ticking);
        ticking = setTimeout(finished, maxTime);
    }

    function finished(err) {
        if (!ticking) {
            err = new Error('Data ingest time out');
        }

        if (err) return done(err);

        result = {
            processed: recordCount,
            inserted: insertCount,
            errors: errorCount,
            generatedKeys: generatedKeys,
            elapsed: timer.elapsed()
        };

        done(null, result);
    }

    function start() {
        // Start the timer...
        timer = new Hoek.Timer();

        parseJSON = JSONStream.parse('.*');
        parseJSON.on('data', onData);
        parseJSON.on('root', onRoot);
        readStream.on('end', onEnd);
        readStream.on('error', onEnd);
        readStream.pipe(parseJSON);
    }

    if (options.truncate) {

        truncate(function () {
            start();
        });

    } else {

        start();
    }
};

internals.ingestFile = function (filepath, options, done) {
    var readStream;

    try {
        readStream = Fs.createReadStream(filepath);
    } catch (err) {
        return done(err);
    }

    return internals.ingest(readStream, options, done);
};

exports.dump = internals.dump;
exports.ingest = internals.ingest;
exports.ingestFile = internals.ingestFile;
