var Url = require('url'),
    Crypto = require('crypto'),
    Uslug = require('uslug'),
    Bcrypt = require('bcrypt'),
    Utils = require('utilities'),
    format = require('util').format,
    pluralize = Utils.inflection.pluralize,
    object = Utils.object,
    string = Utils.string,
    stripTags = string.stripTags,
    internals = {};

/*
    Output a base64url (RFC 4648) encoded string
    when given a crypto-produced hash.
*/
internals.toBase64url = function (cryptoHash) {

    var base64string = cryptoHash.digest('base64');

    return (
        base64string
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    );
};

internals.parseWheres = function (p, q) {

    var where,
        key,
        keys,
        vals,
        whereFilters,
        filters,
        filter,
        flt,
        startTime,
        o;

    where = {};

    if (q.key || q.ids) {

        key = q.key || 'id';
        keys = pluralize(key);

        if (q[keys]) {
            vals = q[keys].split(',');
            where.or = [];
            for (var v in vals) {
                o = {};
                o[key] = vals[v];
                where.or.push(o);
            }
        }

        // Primary or secondary keys.
        return where;
    }

    // Begin dynamic queries...

    if (q.startTime) {

        // Set an end-time for all queries
        startTime = parseInt(q.startTime, 10);
        where.createdAt = {};
        where.createdAt.lte = new Date(startTime);
    }

    if (q.autocomplete) {

        // Key for autocompletion
        key = q.key || 'title';
        where[key] = {};
        where[key].like = q.autocomplete;
    }

    if (q.filters) {

        whereFilters = {};

        // EXAMPLE: ?filters=createdAt|gt|2014-09-03T16:52:41.102Z,hidden|true
        filters = q.filters.split(',');
        for (var f in filters) {
            filter = filters[f];
            flt = filter.split('|');
            if (flt.length === 2) {
                whereFilters[flt[0]] = internals.toBoolean(flt[1]);
            } else if (flt.length === 3) {
                whereFilters[flt[0]] = whereFilters[flt[0]] || {};
                whereFilters[flt[0]][flt[1]] = internals.toBoolean(flt[2]);
            }
        }

        // Default filter mode is 'and', manually set 'or' and 'not'
        if (['or', 'not'].indexOf(q.filterMode) > -1) {
            where[q.filterMode] = whereFilters;
        } else {
            where = whereFilters;
        }
    }

    return where;
};

internals.parseOptions = function (p, q) {

    var options,
        limit,
        offset,
        sort;

    options = {};
    options.sort = {};

    if (q.sort) {
        sort = q.sort.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
        sort = 'desc';
    }

    if (q.orderBy) {
        options.sort[q.orderBy] = sort;
    } else {
        options.sort.createdAt = sort;
    }

    if (q.offset) {
        offset = parseInt(q.offset, 10);
        if (isNaN(offset)) {
            options.skip = 0;
        } else {
            options.skip = offset;
        }
    } else {
        options.skip = 0;
    }

    if (q.limit) {
        limit = parseInt(q.limit, 10);
        if (isNaN(limit)) {
            options.limit = 10;
        } else {
            options.limit = limit;
        }
    } else {
        options.limit = 10;
    }

    // NOTE: Includes have no place just yet...
    //
    // if (q.hasOwnProperty('include')) {

    //     var includes;

    //     if (q.include === 'false' || q.include === '0') {
    //         options.include = false;
    //     } else {
    //         includes = q.include.split(',');
    //         options.include = {};
    //         for (var i in includes) {
    //             options.include[includes[i]] = true;
    //         }
    //     }

    // } else {

    //     options.include = false;
    // }

    options.format = true;
    options.total = true;

    if (q.hasOwnProperty('format')) {
        if (q.format === 'false') {
            options.format = false;
        }
    }

    if (!options.format) {
        options.total = false;
    }

    return options;
};

internals.requestToQuery = function (request) {

    var p = request.params,
        q = request.query,
        query = {},
        where,
        options;

    if (p.id && p.id !== 'byquery') {
        query.where = {};
        query.where.id = p.id;

        // Primary key, quick return.
        return query;
    }

    where = internals.parseWheres(p, q);
    options = internals.parseOptions(p, q);

    query.where = object.isEmpty(where) ? null : where;
    query.options = object.isEmpty(options) ? null : options;

    return query;
};

internals.formatList = function (items, total, type, options) {

    var list = {};

    if (items && items instanceof Array) {
        list.items = items;
        list.count = items.length;
    }

    if (typeof total === 'number') {
        list.total = total;
    }

    if (type) {
        list.type = format('%sList', type);
    }

    if (options) {
        list.offset = options.skip || 0;

        if (options.sort) {
            list.orderBy = Object.keys(options.sort)[0];
            list.sort = options.sort[list.orderBy];
        }

        if (options.hasOwnProperty('limit')) {
            list.limit = options.limit;
        }
    }

    return list;
};

internals.toSlug = function (str) {

    str = stripTags(str).trim();
    return Uslug(str);
};

internals.generateSlug = function ( /*[part1, [part2, [...]]], [separator]*/ ) {

    var length = arguments.length,
        len = length - 1,
        toSlug = internals.toSlug;

    if (length === 1) {

        return toSlug(arguments[0]);

    } else if (length === 0) {

        return;
    }

    var parts = [],
        part,
        arg,
        separator;

    for (var a in arguments) {

        arg = arguments[a];

        if (a < len) {

            part = toSlug(arg);
            parts.push(part);

        } else {

            separator = arg;
        }
    }

    return parts.join(separator || '');
};

internals.generateUrlSafeHash = function (value) {

    var hash = Crypto.createHash('md5').update(value);
    return internals.toBase64url(hash);
};

internals.generateSecureHash = function (value, rounds) {

    return Bcrypt.hashSync(value, rounds || 12);
};

internals.compareSecureHash = function (value, hash) {

    return Bcrypt.compareSync(value, hash);
};

internals.generateRandomPassword = function (length) {

    var buffer = Crypto.randomBytes(length || 18);
    return buffer.toString('base64');
};

internals.requestToCacheKey = function (request) {

    var url,
        user;

    url = {};
    url.pathname = request.path;
    url.query = request.query || {};
    user = request.auth.credentials;

    if (user) {
        url.query.auth = true;
    }

    return Url.format(url);
};

internals.toBoolean = function (str) {
    if (!str) {
        return str;
    }

    if (str.toLowerCase() === 'false') {
        return false;
    }

    if (str.toLowerCase() === 'true') {
        return true;
    }

    return str;
};

internals.envFlag = function (str) {
    if (!str) {
        return undefined;
    }
    if (str === '0') {
        return false;
    }
    if (str === '1') {
        return true;
    }

    return internals.toBoolean(str);
};

internals.noop = function () {};

exports.requestToQuery = internals.requestToQuery;
exports.requestToCacheKey = internals.requestToCacheKey;
exports.formatList = internals.formatList;
exports.slugify = internals.generateSlug;
exports.keyHash = internals.generateUrlSafeHash;
exports.secureHash = internals.generateSecureHash;
exports.compareHash = internals.compareSecureHash;
exports.randomPassword = internals.generateRandomPassword;
exports.envFlag = internals.envFlag;
exports.noop = internals.noop;
exports.toBoolean = internals.toBoolean;
exports.Db = require('./db');
