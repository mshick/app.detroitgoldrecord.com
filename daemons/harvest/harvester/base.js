var Hoek = require('hoek'),
    JSONStream = require('JSONStream'),
    Url = require('url'),
    Wreck = require('wreck'),
    Helpers = require('../helpers'),
    format = require('util').format;

var processTimer;

function Harvester(options) {
    options = options || {};

    this.settings = {};
    this.settings.host = options.host;
    this.settings.auth = options.auth;
    this.settings.endpoints = options.endpoints;
    this.settings.verbose = options.verbose;
    this.settings.timeout = 5 * 60 * 1000; // 5 min
    this.settings.delay = 500; // .5 sec
    this.settings.retries = 5;
}

Harvester.prototype.getTag = function (tagName, options, done) {
    processTimer = new Hoek.Timer();

    var url = this.getUrl(tagName, options.backAnchor);

    if (this.settings.verbose) {
        console.log('Fetching this url: %s', url);
    }

    options.tagName = tagName;
    this.fetch(url, options, done);
};

Harvester.prototype.commit = function (batch, results, done) {
    var self = this,
        payloadEndpoint,
        request,
        payload;

    if (this.settings.verbose) {
        console.log('Committing fetched results');
    }

    if (!batch || batch.length === 0) {
        this.wrapUp(batch, results, done);
        return;
    }

    payloadEndpoint = this.settings.endpoints.payload;
    request = this.buildRequest('batch');

    payload = {
        requests: []
    };

    for (var b in batch) {
        payload.requests.push({
            method: 'post',
            path: payloadEndpoint,
            payload: batch[b]
        });
    }

    request.options.json = false;
    request.options.payload = JSON.stringify(payload);

    Wreck.post(request.url, request.options, function (err, res) {
        if (res.statusCode !== 200) {
            err = new Error(res.error);
        }
        self.wrapUp(batch, results, done);
    });
};

Harvester.prototype.fetch = function (url, options, done) {

    var self = this,
        settings,
        ws,
        batch,
        endOfRecords,
        timedOut,
        processed,
        seen,
        backAnchor,
        min,
        maxRetries,
        retries,
        nextTimer,
        finished;

    settings = this.settings;

    min = options.hasOwnProperty('min') ? options.min : 10;
    if (min === 0) {
        min = -1;
    }

    maxRetries = settings.retries || 0;
    retries = 0;
    batch = [];
    ws = null;
    processed = 0;
    seen = 0;

    function compileResults(err) {
        var results = {
            tag: options.tagName,
            provider: self.name,
            processed: processed,
            seen: seen,
            endOfRecords: endOfRecords,
            backAnchor: backAnchor,
            timedOut: timedOut,
            retries: retries
        };

        if (err) {
            results.error = err.message;
        }

        return results;
    }

    function timer(now) {
        function immediately() {
            onEnd();
        }

        function politely() {
            timedOut = true;
            setTimeout(timer(true), 30 * 1000); // 30 seconds
        }

        return now ? immediately : politely;
    }

    setTimeout(timer(), this.settings.timeout);

    function parseMap(val) {
        seen++;
        if (self.jsonFilter) {
            return (val.type === self.jsonFilter) ? val : null;
        }
        return val;
    }

    function onData(data) {
        var item;

        if (self.conform) {
            item = self.conform(data);
        } else {
            item = data;
        }

        if (item) {
            batch.push(item);
            processed++;
        }
    }

    function onPage(root, count) {

        var result = self.pager(root, options);

        if (options.backAnchor) {
            // If we're going forward, keep resetting
            backAnchor = result.backAnchor;
        }

        if (!options.backAnchor && !backAnchor) {
            backAnchor = result.backAnchor;
        }

        if (result.nextUrl) {
            url = result.nextUrl;
        } else {
            endOfRecords = true;
        }
    }

    function onEnd(err) {
        var results;

        if (err) {
            if (nextTimer) clearTimeout(nextTimer);

            results = compileResults(err);

            if (!finished) {
                finished = true;
                self.wrapUp(null, results, done);
            }

            return;
        }

        if (processed >= min || endOfRecords || timedOut) {
            if (nextTimer) clearTimeout(nextTimer);

            results = compileResults();
            if (!finished) {
                finished = true;
                self.commit(batch, results, done);
            }

            return;
        }

        // recurse
        nextTimer = setTimeout(getNext, settings.delay);
        nextTimer.unref();
    }

    function responseHandler(err, res) {
        if (err || res.statusCode !== 200) {

            if (maxRetries && retries < maxRetries) {

                retries++;
                startHarvest(url);

            } else {

                var results = compileResults(err);

                if (!finished) {
                    finished = true;
                    self.wrapUp(null, results, done);
                }
            }

            return;
        }

        function handleError(err) {
            res.unpipe(parser);
            onEnd(err);
        }

        var parser = JSONStream.parse(self.jsonPath, parseMap);

        parser.on('data', onData);
        parser.on('root', onPage);
        parser.on('error', handleError);

        res.on('error', handleError);
        res.on('end', handleError);

        res.pipe(parser);
    }

    function startHarvest(fromUrl) {
        Wreck.request('GET', fromUrl, {}, responseHandler);
    }

    function getNext() {
        self.progress(url, processed, min);
        startHarvest(url);
    }

    startHarvest(url);
};

Harvester.prototype.progress = function (url, processed, min) {
    if (this.settings.verbose) {
        if (min === -1) {
            min = 'ALL';
        }

        console.log('Getting next page... (%d/%s)', processed, min);
        console.log('URL: %s', url);
    }
};

Harvester.prototype.wrapUp = function (batch, results, done) {

    batch = batch || [];

    var key;

    var request = this.buildRequest('harvests');

    // Primary sort is date, at start of key.
    key = format('%s:%s:%s', Date.now(), results.provider, results.tag);

    results.id = key;
    results.written = batch.length;
    results.elapsed = processTimer.elapsed();

    request.options.payload = JSON.stringify(results);

    Wreck.post(request.url, request.options, function (err, res, payload) {
        if (res.statusCode > 299) {
            err = new Error(res.error);
        }

        done(err, results);
    });
};

Harvester.prototype.buildRequest = function (endpoint, query) {

    var request = {};

    var settings = this.settings;

    var url = Url.format({
        protocol: 'http',
        host: settings.host,
        pathname: settings.endpoints[endpoint],
        query: query
    });

    var options = {};
    options.json = true;
    options.headers = {
        'Authorization': Helpers.authHeader(settings.auth)
    };

    request.url = url;
    request.options = options;

    return request;
};

module.exports = Harvester;
