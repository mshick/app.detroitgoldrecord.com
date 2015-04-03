var Wreck = require('wreck'),
    Url = require('url'),
    Hoek = require('hoek'),
    Async = require('async'),
    Helpers = require('./helpers'),
    Harvester = require('./harvester');

var internals = {};

internals.defaults = {
    host: 'localhost:8000',
    endpoints: {
        batch: '/api/batch',
        payload: '/api/artifacts',
        settings: '/api/settings/harvest',
        harvests: '/api/harvests'
    },
    timeout: 300000, // Max time, 5 minutes
    delay: 5 * 1000, // 1 minute before first harvest
    interval: 60 * 60 * 1000, // 1 hour between harvests
    min: 50, // Minimum records to harvest before finishing
    providers: {
        instagram: true,
        vine: true
    },
    inProgress: false
};

internals.getHarvestTags = function (done) {
    var settings = internals.settings,
        host = settings.host,
        endpoints = settings.endpoints;

    var harvestTags = {};

    function getSettings(next) {

        var url = Url.format({
            protocol: 'http',
            host: host,
            pathname: endpoints.settings
        });

        var options = {};
        options.json = true;
        options.headers = {
            'Authorization': Helpers.authHeader(settings.auth)
        };

        Wreck.get(url, options, function (err, res, harvestSettings) {
            if (err) return next(err);

            if (res.statusCode !== 200) {
                return next(new Error(res.error));
            }

            if (!harvestSettings || !harvestSettings.tags) {
                return next(new Error('Not found.'));
            }

            var tags = harvestSettings.tags.split(',');
            var tagName;

            for (var t in tags) {
                tagName = tags[t];
                harvestTags[tagName] = {};
                harvestTags[tagName].backAnchors = {};
            }

            next();
        });
    }

    function getResults(next) {
        var url = Url.format({
            protocol: 'http',
            host: host,
            pathname: endpoints.harvests,
            query: {
                limit: 50,
                orderBy: 'time',
                sort: 'desc',
                format: false
            }
        });

        var options = {};
        options.json = true;
        options.headers = {
            'Authorization': Helpers.authHeader(settings.auth)
        };

        Wreck.get(url, options, function (err, res, harvestResults) {
            if (err) return next(err);

            if (res.statusCode !== 200) {
                return next(new Error(res.error));
            }

            var tagName,
                providerName,
                backAnchor,
                harvestTag,
                result;

            for (var r in harvestResults) {

                result = harvestResults[r];
                tagName = result.tag;
                providerName = result.provider;
                backAnchor = result.backAnchor;
                harvestTag = harvestTags[tagName];

                if (harvestTag) {

                    if (settings.providers.instagram &&
                        providerName === 'instagram' &&
                        !harvestTag.backAnchors.instagram) {

                        harvestTags[tagName].backAnchors.instagram = backAnchor;

                    }

                    if (settings.providers.vine &&
                        providerName === 'vine' &&
                        !harvestTag.backAnchors.vine) {

                        harvestTags[tagName].backAnchors.vine = backAnchor;

                    }
                }
            }

            next();
        });
    }

    function finished(err) {
        if (err) return done(err);

        var tagsToGet = [],
            tag;

        for (var t in harvestTags) {
            tag = harvestTags[t];
            tag.name = t;

            tagsToGet.push(tag);
        }
        done(null, tagsToGet);
    }

    Async.series([getSettings, getResults], finished);
};

internals.makeHarvesters = function () {
    var settings = internals.settings,
        providerSettings,
        harvesters = [],
        harvester;

    for (var provider in settings.providers) {
        providerSettings = settings.providers[provider];

        if (providerSettings) {

            harvester = Harvester.createHarvester({
                provider: provider,
                verbose: settings.verbose,
                providerSettings: providerSettings,
                host: settings.host,
                auth: settings.auth,
                endpoints: settings.endpoints
            });

            harvesters.push(harvester);
        }
    }

    return harvesters;
};

internals.createHarvestTasks = function (tags) {

    var tasks,
        tag,
        harvesters,
        harvester;

    harvesters = internals.makeHarvesters();

    tasks = [];

    for (var t in tags) {
        tag = tags[t];
        for (var h in harvesters) {

            harvester = harvesters[h];

            tasks.push({
                harvester: harvesters[h],
                tagName: tag.name,
                options: {
                    backAnchor: tag.backAnchors[harvester.name],
                    min: internals.settings.min
                }
            });
        }
    }

    return tasks;
};

internals.doHarvest = function () {

    var settings,
        killTimer,
        tasks,
        queue,
        results;

    settings = internals.settings;

    if (settings.inProgress) {
        console.warn('Harvest in progress. Skipping...');
        return;
    }

    results = [];

    function worker(task, done) {
        task.harvester.getTag(task.tagName, task.options, function (err, result) {
            if (err) {
                console.error('Bad harvest!', err);
            }
            results.push(result);
            done(err);
        });
    }

    queue = Async.queue(worker, 2);

    killTimer = setTimeout(queue.kill, settings.timeout);
    killTimer.unref();

    queue.drain = function () {
        clearTimeout(killTimer);
        internals.settings.inProgress = false;
        console.warn('Harvest queue done');
        if (settings.verbose) {
            console.info('Results:', results);
        }
    };

    console.warn('Starting harvest...');

    function getHarvestTags(next) {
        internals.getHarvestTags(function (err, tags) {
            if (err) return next(err);
            tasks = internals.createHarvestTasks(tags);
            next();
        });
    }

    function startHarvest(next) {
        queue.push(tasks);
    }

    Async.series([getHarvestTags, startHarvest]);
};

internals.startHarvesting = function (interval) {
    console.log('Started harvesting at a %d second interval', interval / 1000);

    // Start one right away.
    setImmediate(internals.doHarvest);

    // Set up the timer.
    var harvesting = setInterval(internals.doHarvest, interval);

    process.on('SIGINT', function () {
        clearInterval(harvesting);
        console.log('Harvest stopped');
        process.exit();
    });
};

internals.start = function (options) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});
    internals.settings = settings;

    setTimeout(internals.startHarvesting, settings.delay, settings.interval);

    console.log('Starting harvest in %d seconds...', settings.delay / 1000);
};

exports.start = internals.start;
