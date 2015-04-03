var Path = require('path'),
    Util = require('util'),
    Config = require('../config'),
    staticPath = Config.static.path;

function iconSizedPath(base, ext) {

    return function (request) {
        var file,
            size;

        size = request.params.size;
        file = Util.format('%s-%s.%s', base, size, ext);
        return Path.join(staticPath, 'img', file);
    };
}

var routes = [{
    method: 'GET',
    path: '/static/{path*}',
    config: {
        handler: {
            directory: {
                path: Path.join(staticPath),
                index: false,
                listing: false
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/css/{path*}',
    config: {
        handler: {
            directory: {
                path: Path.join(staticPath, 'css'),
                index: false,
                listing: false
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/js/{path*}',
    config: {
        handler: {
            directory: {
                path: Path.join(staticPath, 'js'),
                index: false,
                listing: false
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/img/{path*}',
    config: {
        handler: {
            directory: {
                path: Path.join(staticPath, 'img'),
                index: false,
                listing: false
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/fonts/{path*}',
    config: {
        handler: {
            directory: {
                path: Path.join(staticPath, 'fonts'),
                index: false,
                listing: false
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/favicon.ico',
    config: {
        handler: {
            file: {
                path: Path.join(staticPath, 'img', 'favicon.ico')
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/apple-touch-icon.png',
    config: {
        handler: {
            file: {
                path: Path.join(staticPath, 'img', 'apple-touch-icon.png')
            }
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/apple-touch-icon-{size}.png',
    config: {
        handler: {
            file: iconSizedPath('apple-touch-icon', 'png')
        },
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/robots.txt',
    config: {
        handler: {
            file: {
                path: Path.join(staticPath, 'robots.txt')
            }
        },
        tags: ['public']
    }
}];

module.exports = routes;
