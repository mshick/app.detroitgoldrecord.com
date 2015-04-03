var Pages = require('../controllers').pages;

var routes = [{
    method: 'GET',
    path: '/',
    handler: Pages.redirect('/login'),
    config: {
        cache: {
            expiresIn: -1
        },
        description: 'Redirects to login page.',
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/{p*}',
    handler: Pages.catchAll,
    config: {
        cache: {
            expiresIn: -1
        },
        description: 'Catch-all route. Returns 404.',
        tags: ['public']
    }
}, {
    method: 'GET',
    path: '/admin',
    handler: Pages.admin,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: {
            strategies: ['session'],
            mode: 'try'
        },
        tags: ['admin', 'auth']
    }
}, {
    method: 'GET',
    path: '/admin/{collection}',
    handler: Pages.adminList,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: 'session',
        tags: ['admin', 'auth']
    }
}, {
    method: 'GET',
    path: '/admin/harvesting',
    handler: Pages.harvesting,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: 'session',
        tags: ['admin', 'auth']
    }
}, {
    method: 'GET',
    path: '/admin/submissions',
    handler: Pages.submissionList,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: 'session',
        tags: ['admin', 'auth']
    }
}, {
    method: 'GET',
    path: '/login',
    handler: Pages.login,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: {
            strategies: ['session'],
            mode: 'try'
        },
        tags: ['admin', 'public']
    }
}, {
    method: 'POST',
    path: '/login',
    handler: Pages.login,
    config: {
        tags: ['admin', 'public']
    }
}, {
    method: 'GET',
    path: '/logout',
    handler: Pages.logout,
    config: {
        cache: {
            expiresIn: -1
        },
        tags: ['admin']
    }
}, {
    method: 'GET',
    path: '/ping',
    handler: Pages.ping,
    config: {
        cache: {
            expiresIn: -1
        },
        tags: ['health']
    }
}, {
    method: 'GET',
    path: '/tag/{tag}',
    handler: Pages.tag
}];

module.exports = routes;
