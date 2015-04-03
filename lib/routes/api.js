var Api = require('../controllers').api,
    Settings = require('../controllers').settings,
    Tools = require('../controllers').tools;

var routes = [{
    method: 'PUT',
    path: '/api/{collection}/{id}',
    handler: Api.edit,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        description: 'For editing and updating docs.',
        notes: '@collection: artifacts|pages, @id: {base64id}|{byquery}',
        tags: ['content api', 'auth']
    }
}, {
    method: 'GET',
    path: '/api/{collection}/{id}',
    handler: Api.read,
    config: {
        cache: {
            expiresIn: 10 * 60 * 1000,
            privacy: 'public'
            // expiresIn: -1
        },
        auth: {
            strategies: ['basic', 'session'],
            mode: 'try'
        },
        description: 'For reading individual docs.',
        notes: '@collection: artifacts|pages, @id: {base64id}|{byquery}',
        tags: ['content api', 'public']
    }
}, {
    method: 'GET',
    path: '/api/{collection}',
    handler: Api.browse,
    config: {
        cache: {
            expiresIn: 10 * 60 * 1000,
            privacy: 'public'
            // expiresIn: -1
        },
        auth: {
            strategies: ['basic', 'session'],
            mode: 'try'
        },
        description: 'For browsing a collection of docs.',
        notes: '@collection: artifacts|pages.',
        tags: ['content api', 'public']
    }
}, {
    method: 'POST',
    path: '/api/{collection}',
    handler: Api.add,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['content api', 'auth']
    }
}, {
//     method: 'POST',
//     path: '/api/submission',
//     handler: Api.submission,
//     config: {
//         validate: {
//             payload: {
//                 submittedBy: Joi.string().required(),
//                 videoUrl: Joi.string().required(),
//                 videoLowUrl: Joi.string().required(),
//                 thumbnailUrl: Joi.string().required(),
//                 location: Joi.string().allow('').optional(),
//                 description: Joi.string().required()
//             }
//         },
//         tags: ['content api', 'user submissions']
//     }
// }, {
    method: 'DELETE',
    path: '/api/{collection}',
    handler: Api.truncate,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['content api', 'auth']
    }
}, {
    method: 'DELETE',
    path: '/api/{collection}/{id}',
    handler: Api.destroy,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['content api', 'auth']
    }
}, {
//     method: 'GET',
//     path: '/api/dump/{type}',
//     handler: Tools.dataDump,
//     config: {
//         cache: {
//             expiresIn: -1
//         },
//         auth: {
//             strategies: ['basic', 'session']
//         },
//         tags: ['data api', 'auth']
//     }
// }, {
    method: 'POST',
    path: '/api/import/{type}',
    handler: Tools.dataImport,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        payload: {
            output: 'file'
        },
        tags: ['data api', 'auth']
    }
}, {
    method: 'GET',
    path: '/api/settings/{group}',
    handler: Settings.read,
    config: {
        cache: {
            expiresIn: -1
        },
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['settings api', 'auth']
    }
}, {
    method: 'POST',
    path: '/api/settings/{group}/{key}',
    handler: Settings.add,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['settings api', 'auth']
    }
}, {
    method: 'PUT',
    path: '/api/settings/{group}/{key}',
    handler: Settings.edit,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['settings api', 'auth']
    }
}, {
    method: 'DELETE',
    path: '/api/cache/{segment}',
    handler: Tools.clearCache,
    config: {
        auth: {
            strategies: ['basic', 'session']
        },
        tags: ['data api', 'auth']
    }
}];

module.exports = routes;
