var Path = require('path'),
    Hoek = require('hoek'),
    Multilevel = require('multilevel'),
    Net = require('net'),
    LevelUp = require('levelup'),
    Sublevel = require('level-sublevel'),
    MappedIndex = require('level-mapped-index');

var defaults = {
    dbOptions: {
        keyEncoding: 'utf8',
        valueEncoding: 'json'
    }
};

function DbServer(options) {
    options = options || {};

    this.settings = Hoek.applyToDefaults(defaults, options);
    this.db = null;
}

DbServer.prototype.registerIndexes = function (db, indexes, options) {
    if (options && options.valueEncoding !== 'json') return;

    db = MappedIndex(db);

    function map(indexName) {
        return function (key, value, emit) {
            if (value && value[indexName]) {
                emit(value[indexName]);
            }
        };
    }

    for (var indexName in indexes) {
        db.registerIndex(indexName, map(indexName));
    }

    db.methods.createIndexedStream = {
        type: 'readable'
    };

    db.methods.getBy = {
        type: 'async'
    };
};

DbServer.prototype.createSublevels = function (sublevels) {
    var self = this,
        db,
        sublevel,
        config,
        options;

    db = this.db;

    db.sublevels = db.sublevels || {};

    for (var sl in sublevels) {
        if (sublevels[sl]) {

            config = {};
            options = this.settings.dbOptions;

            if (sublevels[sl] instanceof Object) {

                config = sublevels[sl];

                if (config.options) {
                    options = Hoek.applyToDefaults(options, config.options);
                }
            }

            sublevel = db.sublevel(sl, options);

            if (config.indexes) {
                self.registerIndexes(sublevel, config.indexes, options);
            }

            this.db.sublevels[sl] = sublevel;
        }
    }
};

DbServer.prototype.writeManifest = function (manifest) {
    var db,
        filepath;

    db = this.db;
    filepath = Path.resolve(__dirname, this.settings.manifest);
    Multilevel.writeManifest(db, filepath);
};

DbServer.prototype.createServer = function (port, host, config) {
    var options,
        db,
        server,
        dataPath;

    if (config.options instanceof Object) {
        options = Hoek.applyToDefaults(this.settings.dbOptions, config.options);
    } else {
        options = this.settings.dbOptions;
    }

    dataPath = Path.resolve(__dirname, this.settings.data);

    db = new LevelUp(dataPath, options);
    db = new Sublevel(db);

    if (config.indexes) {
        this.registerIndexes(db, config.indexes, options);
    }

    this.db = db;
    this.createSublevels(config.sublevels);
    this.writeManifest();

    server = Net.createServer(function (conn) {
        conn
            .pipe(Multilevel.server(db))
            .pipe(conn);
    });

    server.listen(config.port, config.host);

    return server;
};

module.exports = DbServer;
