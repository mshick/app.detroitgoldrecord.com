var Util = require('util'),
    Hoek = require('hoek'),
    EventEmitter = require('events').EventEmitter,
    Multilevel = require('multilevel'),
    Reconnect = require('reconnect-net');

function Db(options) {
    this.socket = null;
    this.client = null;
}

Util.inherits(Db, EventEmitter);

Db.prototype.createClient = function (port, host, options) {

    var self = this,
        connectionEstablished;

    options = options || {};

    if (this.client) {
        return this.client;
    }

    function connectFn(conn) {

        var rpc = self.client.createRpcStream();

        rpc.on('error', function (err) {
            self.emit('error', err);
        });

        if (options.auth) {
            self.client.auth(options.auth);
        }

        conn.pipe(rpc).pipe(conn);
        connectionEstablished = true;
        self.emit('connect');
    }

    this.client = Multilevel.client(options.manifest);
    this.socket = new Reconnect(connectFn).connect(port, host, options);

    this.socket.on('disconnect', function () {
        if (connectionEstablished) {
            self.emit('disconnect');
        } else {
            self.emit('error', new Error('Unsuccessful connection'));
        }
    });

    this.socket.on('reconnect', function (attempts, delay) {
        if (options._reconnectAttempts && options._reconnectAttempts > attempts) {
            self.socket.reconnect = false;
            self.emit('error', new Error('Max reconnect attempts exceeded'));
        } else {
            self.emit('reconnect');
        }
    });

    this.socket.on('error', function (err) {
        self.emit('error', err);
    });

    return this.client;
};

Db.prototype.quit = function () {
    if (this.client) {
        this.client.close();
        this.client = null;
    }

    if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
    }
};

Db.prototype.drop = function (options, done) {

    options = options || {};

    var client,
        timer,
        results,
        processed,
        deleted,
        errors,
        key,
        segments;

    timer = new Hoek.Timer();
    key = {};

    if (options.sublevel) {
        client = this.client.sublevel(options.sublevel);
    } else {
        client = this.client;
    }

    if (options.partition) {
        key.partition = options.partition;
    }

    segments = options.segments;

    processed = 0;
    deleted = 0;
    errors = 0;

    function drop() {
        var segment,
            startKey,
            endKey,
            query,
            batch;

        if ((segment = segments.shift())) {

            key.segment = segment;

            startKey = Db._generateKey(key);
            endKey = Db._generateKey(key) + '\xFF';

            query = {
                gte: startKey,
                lte: endKey
            };

            batch = [];

            client.createReadStream(query)
                .on('data', function (data) {
                    processed++;
                    deleted++;
                    batch.push({
                        key: data.key
                    });
                })
                .on('error', function (err) {
                    processed++;
                    errors++;
                })
                .on('close', function () {
                    client.batch(batch, {
                        type: 'del'
                    }, drop);
                });
        } else {

            results = {
                elapsed: timer.elapsed(),
                processed: processed,
                deleted: deleted,
                errors: errors
            };

            done(null, results);
        }
    }

    drop();
};

Db._generateKey = function (opts) {

    var key = '';

    if (opts.partition) {
        key += encodeURIComponent(opts.partition) + '!';
    }

    if (opts.segment) {
        key += encodeURIComponent(opts.segment) + '!';
    }

    if (opts.id) {
        key += encodeURIComponent(opts.id);
    }

    return key;
};

module.exports = Db;
