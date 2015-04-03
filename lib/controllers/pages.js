var Async = require('async'),
    Utils = require('utilities'),
    Hapi = require('hapi'),
    Api = require('../api'),
    caches = require('../cache').caches,
    Auth = require('./auth'),
    Models = require('../models'),
    string = Utils.string,
    uuid = string.uuid,
    capitalize = string.capitalize,
    notFound = Hapi.error.notFound();

var internals;

internals = {};

internals.redirect = function (redirectTo) {
    return function (request, reply) {
        reply.redirect(redirectTo);
    };
};

internals.login = function (request, reply) {
    var payload = request.payload,
        context = {},
        toSuccess = '/admin',
        sid;

    if (request.auth.isAuthenticated) {
        return reply.redirect(toSuccess);
    }

    context.title = 'Login';
    context.error = '';

    if (request.method === 'post') {
        if (!payload.username || !payload.password) {
            context.error = 'Username or password missing';
            return reply.view('login', context);
        }

        Auth.validate(payload.username, payload.password, function (err, valid, account) {
            if (err || !account) {
                console.error(err);
                context.error = 'Invalid username or password';
                return reply.view('login', context);
            }

            if (account) {
                sid = uuid();
                caches.session.set(sid, {
                    account: account
                }, 0, function (err) {
                    if (err) return reply(err);
                    request.auth.session.set({
                        sid: sid
                    });
                    reply.redirect(toSuccess);
                });
            }
        });
    }

    if (request.method === 'get') {
        return reply.view('login', context);
    }
};

internals.logout = function (request, reply) {
    if (request.auth && request.auth.session) {
        request.auth.session.clear();
    }
    reply.redirect('/login');
};

internals.catchAll = function (request, reply) {
    reply().code(404);
};

internals.admin = function (request, reply) {

    if (!request.auth.isAuthenticated) {
        return reply.redirect('/login');
    }

    var context = {
        title: 'Dashboard',
        path: request.path
    };

    var Artifact = Models.Artifact;

    function getArtifacts(next) {
        Api.artifacts.browse({
            pending: true
        }, {
            format: true,
            limit: 4,
            sort: {
                createdAt: 'desc'
            }
        }, function (err, artifactList) {

            context.list = artifactList;
            next(err);

        });
    }

    function getTotal(next) {
        Artifact.count({}, function (err, count) {
            context.totalCount = count;
            next(err);
        });
    }

    function getHarvest(next) {
        Api.harvests.browse({
            sort: {
                createdAt: 'desc'
            }
        }, function (err, harvests) {
            if (harvests) {
                context.harvest = harvests[0];
            }
            next(err);
        });
    }

    function getApprovedCount(next) {
        Artifact.count({
            approved: true
        }, function (err, count) {
            context.approvedCount = count;
            next(err);
        });
    }

    function getPendingCount(next) {
        Artifact.count({
            pending: true
        }, function (err, count) {
            context.pendingCount = count;
            next(err);
        });
    }

    function getRejectedCount(next) {
        Artifact.count({
            pending: false,
            approved: false
        }, function (err, count) {
            context.rejectedCount = count;
            next(err);
        });
    }

    function finish(err) {
        reply.view('admin/dashboard', context);
    }

    Async.parallel([getArtifacts, getTotal, getHarvest, getApprovedCount, getPendingCount, getRejectedCount], finish);
};

internals.adminList = function (request, reply) {

    if (!request.auth.isAuthenticated) {
        return reply.redirect('/login');
    }

    var collection,
        context,
        query,
        where,
        opts,
        perPage,
        pageNum;

    perPage = 32;
    collection = request.params.collection;
    query = request.query;

    if (!Api[collection]) {
        return reply(notFound);
    }

    where = {
        submitted: false
    };

    opts = {
        total: true,
        format: true,
        limit: perPage,
        sort: {
            createdAt: 'desc'
        }
    };

    if (query.page) {
        pageNum = parseInt(query.page, 10) - 1;
        opts.skip = perPage * pageNum;
    }

    context = {
        title: capitalize(collection)
    };

    Api[collection].browse(where, opts, function (err, result) {
        context.list = result;
        context.path = request.path;
        reply.view('admin/admin-list', context);
    });
};

internals.submissionList = function (request, reply) {

    if (!request.auth.isAuthenticated) {
        return reply.redirect('/login');
    }

    var collection,
        context,
        query,
        where,
        opts,
        perPage,
        pageNum;

    perPage = 32;
    collection = request.params.collection;
    query = request.query;

    where = {
        submitted: true
    };

    opts = {
        total: true,
        format: true,
        limit: perPage,
        sort: {
            createdAt: 'desc'
        }
    };

    if (query.page) {
        pageNum = parseInt(query.page, 10) - 1;
        opts.skip = perPage * pageNum;
    }

    context = {
        title: capitalize(collection)
    };

    Api.artifacts.browse(where, opts, function (err, result) {
        context.list = result;
        context.path = request.path;
        reply.view('admin/admin-list', context);
    });
};

internals.harvesting = function (request, reply) {

    var context = {
        title: 'Harvesting',
        path: request.path
    };

    Api.settings.read('harvest', function (err, settings) {

        var setting;
        context.settings = {};
        for (var s in settings) {
            setting = settings[s];
            context.settings[s] = setting;
        }

        Api.harvests.browse({}, {
            format: false,
            limit: 20,
            sort: {
                createdAt: 'desc'
            }
        }, function (err, harvests) {
            context.harvests = harvests;
            reply.view('admin/harvesting', context);
        });
    });
};

internals.ping = function (request, reply) {
    reply('pong');
};

internals.tag = function (request, reply) {
    var context = {
        title: 'Artifacts By Tag',
        path: request.path,
        tag: request.params.tag
    };

    var opts = {
        // total: true,
        format: true,
        // limit: 50,
        sort: {
            createdAt: 'desc'
        }
    };

    var where = {};

    if (context.tag) {
        where.tags = context.tag;
    }

    Api.artifacts.browse(where, opts, function (err, result) {
        if (!result || !result.items || !result.items.length) {
            return reply(Hapi.error.notFound());
        }

        var item;
        for (var i in result.items) {
            item = result.items[i];
            item.isShown = true;

            if (item.hidden === true) {
                item.isShown = false;
            }
            if (item.pending === false && item.approved === false) {
                item.isShown = false;
            }
        }
        context.list = result;
        reply.view('iframe', context, { layout: false });
    });
};

module.exports = internals;
