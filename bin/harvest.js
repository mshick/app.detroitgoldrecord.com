#!/usr/local/bin/node

// Valid args:
// --provider=
// --tag=
// --count=

// TARGET DATA:
// {
//     "provider": "instagram",
//     "providerId": "abc",
//     "providerPermalinkUrl": "http://instagr.am/p/D/",
//     "providerUsername": "kevin",
//     "providerUserId": "3",
//     "avatarUrl": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_6.jpg",
//     "thumbnailUrl": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_6.jpg",
//     "thumbnailDimensions": { "height": 480, "width": 480 },
//     "tags": [ "foo", "bar" ],
//     "videoUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_101.mp4",
//     "videoLowUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_102.mp4",
//     "description": "",
//     "explicit": false,
//     "type": "video"
//     "createdAt": "2014-09-04T13:28:06.000000"
// }

// https://api.vineapp.com/timelines/tags/snow?page=0
// https://api.instagram.com/v1/tags/snow/media/recent?client_id=8d3634717a5d41d290c56405357e62e3
// COUNT (max=~40), MIN_TAG_ID, MAX_TAG_ID
// End condition: pagination.next_url does not exist

var TIMEOUT = 5 * 60 * 1000; // 5 mins
var PROVIDERS = ['instagram', 'vine'];
var OUTPUT_DIR = './silo';
var INSTAGRAM_CLIENT_ID = '8d3634717a5d41d290c56405357e62e3';

var argv = require('minimist')(process.argv.slice(2)),
    provider = argv.provider,
    tag = argv.tag,
    limit = argv.limit || 10,
    backAnchor = argv.backanchor || null;

if (!provider || PROVIDERS.indexOf(provider) < 0 || !tag) {
    console.error('No provider or tag specified.');
    process.exit(1);
}

var Path = require('path'),
    Fs = require('fs-extra'),
    Hoek = require('hoek'),
    JSONStream = require('JSONStream'),
    Wreck = require('wreck'),
    Utils = require('utilities'),
    date = Utils.date,
    reach = Hoek.reach,
    format = require('util').format,
    timer = new Hoek.Timer();

function startWriteStream(filepath) {
    Fs.ensureFileSync(filepath);

    var opts = {
        flags: 'a' // append mode
    };

    return Fs.createWriteStream(filepath, opts);
}

function progress(written, limit) {
    console.log('Getting next page... (%d/%d)', written, limit);
}

function makeFilename(provider, tag) {
    var datestamp = date.strftime(new Date(), '%F-%T').replace(/:/g, '_');
    return format('%s-%s-%s.json', provider, tag, datestamp);
}

function harvest(url, options, done) {

    var parsePattern = options.parsePattern,
        conformFn = options.conformFn,
        pageFn = options.pageFn,
        typeFilter = options.typeFilter,
        filepath = options.filepath,
        ws,
        endOfRecords,
        timedOut,
        nextUrl,
        written,
        seen,
        backAnchor;

    limit = options.limit || 10;
    ws = null;
    written = 0;
    seen = 0;

    function compileResults() {
        var results = {
            written: written,
            seen: seen,
            endOfRecords: endOfRecords,
            backAnchor: backAnchor,
            timedOut: timedOut,
            filename: options.filename
        };
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

    setTimeout(timer(), TIMEOUT);

    function parseMap(val) {
        seen++;
        if (typeFilter) {
            return (val.type === typeFilter) ? val : null;
        }
        return val;
    }

    function onData(data) {
        var conformed;

        if (written !== limit) {

            if (written) {
                ws.write(',\n');
            }

            if (conformFn) {
                conformed = conformFn(data);
            } else {
                conformed = data;
            }

            ws.write(JSON.stringify(conformed));
            written++;
        }
    }

    function onPage(root, count) {
        var result = pageFn(root);

        if (!result) {
            endOfRecords = true;
            return;
        }

        if (result.nextUrl) {
            nextUrl = result.nextUrl;
        }

        if (!backAnchor && result.backAnchor) {
            backAnchor = result.backAnchor;
        }
    }

    function onEnd(err) {
        if (err) return done(err);

        if (written === limit || endOfRecords || timedOut) {
            ws.end('\n]');

            var results = compileResults();
            return done(err, results);
        }

        // recurse
        progress(written, limit);
        startHarvest(nextUrl);
    }

    function responseHandler(err, res) {
        if (err) return done(err);

        if (!ws) {
            ws = startWriteStream(filepath);
            ws.write('[\n');
        }

        var parser = JSONStream.parse(parsePattern, parseMap);

        parser.on('data', onData);
        parser.on('root', onPage);

        res.pipe(parser);
        res.on('error', onEnd);
        res.on('end', function () {
            res.unpipe(parser);
            onEnd();
        });
    }

    function startHarvest(fromUrl) {
        Wreck.request('GET', fromUrl, {}, responseHandler);
    }

    startHarvest(url);
}

function wrapUp(err, results) {
    var backAnchor,
        filepath,
        time,
        seconds;

    if (err) {
        console.error('Error parsing stream', err);
        process.exit(1);

    } else {

        time = timer.elapsed();
        seconds = time / 1000;

        console.log('Wrote %d records in %s seconds', results.written, seconds);
        console.log('Checked %d records', results.seen);
    }

    if (results.endOfRecords) {
        console.log('Reached end of records');
    }

    if (results.timedOut) {
        console.warn('Time limit exceeded!');
    }

    if (results.backAnchor) {

        backAnchor = results.backAnchor;
        console.log('To only get newer records in a future run pass in with the --backanchor=%s', backAnchor);
        filepath = Path.join(OUTPUT_DIR, results.filename.replace('.json', '.backanchor'));
        Fs.writeFileSync(filepath, backAnchor);
    }

    process.exit();
}

function getInstagram(tag, limit) {
    var url,
        opts;

    opts = {};
    opts.parsePattern = 'data.*';
    opts.limit = limit;

    url = format('https://api.instagram.com/v1/tags/%s/media/recent?client_id=%s&count=50', tag, INSTAGRAM_CLIENT_ID);

    if (backAnchor) {
        url = format('%s&min_tag_id=%s', url, backAnchor);
    }

    opts.filename = makeFilename('instagram', tag);
    opts.filepath = Path.join(OUTPUT_DIR, opts.filename);

    opts.typeFilter = 'video';

    opts.conformFn = function (data) {
        var conf = {};

        // Basic
        conf.type = 'video';
        conf.provider = 'instagram';
        conf.createdAt = new Date(parseInt(data.created_time, 10) * 1000);
        conf.providerId = data.id.toString();
        conf.providerPermalinkUrl = data.link;

        // User
        conf.providerUsername = reach(data, 'user.username');
        conf.providerUserId = reach(data, 'user.id');
        conf.providerUserUrl = 'https://instagram.com/' + conf.providerUsername;
        conf.avatarUrl = reach(data, 'user.profile_picture');

        // 306x306 Thumb
        conf.thumbnailUrl = reach(data, 'images.low_resolution.url');
        conf.thumbnailDimensions = {};
        conf.thumbnailDimensions.width = reach(data, 'images.low_resolution.width');
        conf.thumbnailDimensions.height = reach(data, 'images.low_resolution.height');

        // 640x640 Video
        conf.videoUrl = reach(data, 'videos.standard_resolution.url');
        conf.videoDimensions = {};
        conf.videoDimensions.width = reach(data, 'videos.standard_resolution.width');
        conf.videoDimensions.height = reach(data, 'videos.standard_resolution.height');

        // 480x480 Video (low)
        conf.videoLowUrl = reach(data, 'videos.low_resolution.url');
        conf.videoLowDimensions = {};
        conf.videoLowDimensions.width = reach(data, 'videos.low_resolution.width');
        conf.videoLowDimensions.height = reach(data, 'videos.low_resolution.height');

        // Content
        conf.description = reach(data, 'caption.text');
        conf.tags = data.tags;

        if (data.location) {
            conf.locationName = data.location.name;
            conf.locationCoordinates = {};
            conf.locationCoordinates.latitude = data.location.latitude;
            conf.locationCoordinates.longitude = data.location.longitude;
        }

        return conf;
    };

    opts.pageFn = function (root) {
        var result = {};
        var page = root.pagination;

        if (page.next_url) {

            result.nextUrl = page.next_url;
            result.backAnchor = page.min_tag_id;
            return result;
        }
    };

    harvest(url, opts, wrapUp);
}

function getVine(tag, limit) {
    var url,
        opts;

    url = format('https://api.vineapp.com/timelines/tags/%s?size=50', tag);
    if (backAnchor) {
        url = format('%s&backAnchor=%s', url, backAnchor);
    }

    opts = {};
    opts.parsePattern = 'data.records.*';
    opts.limit = limit;
    opts.filename = makeFilename('vine', tag);
    opts.filepath = Path.join(OUTPUT_DIR, opts.filename);

    opts.conformFn = function (data) {
        var conf = {};

        // Basic
        conf.type = 'video';
        conf.provider = 'vine';
        conf.createdAt = new Date(data.created);
        conf.providerId = Path.basename(data.shareUrl);
        conf.providerPermalinkUrl = data.shareUrl;

        // User
        conf.providerUsername = data.username;
        conf.providerUserId = data.userId.toString();
        conf.providerUserUrl = 'https://vine.co/u/' + conf.providerUsername;
        conf.avatarUrl = data.avatarUrl;

        // 480x480 Thumb
        conf.thumbnailUrl = data.thumbnailUrl;
        conf.thumbnailDimensions = {};
        conf.thumbnailDimensions.width = 480;
        conf.thumbnailDimensions.height = 480;

        // 480x480 Video
        conf.videoUrl = data.videoUrl;
        conf.videoDimensions = {};
        conf.videoDimensions.width = 480;
        conf.videoDimensions.height = 480;

        // 480x480 Video (low)
        conf.videoLowUrl = data.videoLowURL;
        conf.videoLowDimensions = {};
        conf.videoLowDimensions.width = 480;
        conf.videoLowDimensions.height = 480;

        // Content
        conf.description = data.description;
        conf.tags = data.entities.map(function (entity) {
            if (entity.type === 'tag') {
                return entity.title;
            }
        });

        if (data.venueName) {
            conf.locationName = data.venueName;
        }
        if (data.venueCity) {
            conf.locationCity = data.venueCity;
        }
        if (data.venueState) {
            conf.locationState = data.venueState;
        }
        if (data.venueCountryCode) {
            conf.locationCountryCode = data.venueCountryCode;
        }

        return conf;
    };

    opts.pageFn = function (root) {
        var result,
            anchor,
            data;

        result = {};
        data = root.data;

        if (data.nextPage) {
            anchor = data.anchorStr;

            if (!backAnchor) {
                result.nextUrl = format('%s&anchor=%s', url, anchor);
            }

            result.backAnchor = data.backAnchor;
            return result;
        }
    };

    harvest(url, opts, wrapUp);
}

function main(provider, tag, limit) {

    if (provider === 'instagram') {
        getInstagram(tag, limit);
    }

    if (provider === 'vine') {
        getVine(tag, limit);
    }
}

main(provider, tag, limit);
