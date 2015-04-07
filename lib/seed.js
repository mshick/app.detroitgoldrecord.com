var Path = require('path'),
    // Prompt = require('sync-prompt').prompt,
    Data = require('./api').data,
    Models = require('./models'),
    Config = require('./config'),
    appRoot = Config.appRoot,
    internals;

internals = {};

// TODO: Change to test a special prop in setting table

internals.hasData = function (done) {

    var Video = Models.Video;
    Video.count({}, done);
};

internals.doIngest = function (done) {
    var filepath = Path.join(appRoot, 'seed-data.json');
    Data.ingestFile(filepath, {
        type: 'video'
    }, done);
};

internals.decisions = function (existing, done) {

    var yesno;

    function affirmative() {
        internals.doIngest(function (err, result) {
            if (err) {
                console.error('Database init problem', err);
            } else {
                console.info('Done! #grey{%d docs imported in %d seconds}', result.inserted, result.elapsed / 1000);
            }
            done();
        });
    }

    if (existing) {

        // console.info('Database has already been initialized, should I proceed?');
        // console.warn('[ALL DATA WILL BE REMOVED!]');
        // yesno = Prompt('Yes or [No]:');

        // if (yesno.toLowerCase() === 'yes') {

        //     affirmative();

        // } else {

            console.info('Leaving database untouched.');
            done();
        // }

    } else {

        affirmative();
    }
};

exports.init = function (server, options, next) {
    var hasData = internals.hasData;

    console.info('Initializing a database...');

    hasData(function (err, result) {
        if (err) {
            console.error('Database init problem', err);
            return next();
        }

        internals.decisions(result, next);
    });
};
