var Model = require('model'),
    format = require('util').format,
    Helpers = require('../helpers'),
    keyHash = Helpers.keyHash,
    slugify = Helpers.slugify;

var Artifact = function () {
    this.defineProperties({
        id: {
            type: 'string',
            required: true,
            isSystem: true
        },
        provider: {
            type: 'string',
            required: true
        },
        hkey: {
            type: 'string',
            require: true
        },
        providerId: {
            type: 'string',
            require: true
        },
        providerPermalinkUrl: {
            type: 'string'
        },
        providerUsername: {
            type: 'string'
        },
        providerUserUrl: {
            type: 'string'
        },
        providerUserId: {
            type: 'string'
        },
        avatarUrl: {
            type: 'string'
        },
        thumbnailUrl: {
            type: 'string'
        },
        thumbnailDimensions: {
            type: 'object'
        },
        imageUrl: {
            type: 'string'
        },
        imageDimensions: {
            type: 'object'
        },
        videoUrl: {
            type: 'string'
        },
        videoDimensions: {
            type: 'object'
        },
        videoLowUrl: {
            type: 'string'
        },
        videoLowDimensions: {
            type: 'object'
        },
        location: {
            type: 'string'
        },
        locationName: {
            type: 'string'
        },
        locationCity: {
            type: 'string'
        },
        locationState: {
            type: 'string'
        },
        locationCountryCode: {
            type: 'string'
        },
        locationCoordinates: {
            type: 'object'
        },
        description: {
            type: 'text'
        },
        tags: {
            type: 'object'
        },
        explicit: {
            type: 'boolean',
            required: true
        },
        approved: {
            type: 'boolean',
            required: true
        },
        pending: {
            type: 'boolean',
            required: true
        },
        hidden: {
            type: 'boolean',
            required: true
        },
        submitted: {
            type: 'boolean',
            required: true
        },
        submittedBy: {
            type: 'string'
        },
        updatedBy: {
            type: 'string'
        },
        createdBy: {
            type: 'string'
        }
    });

    this.beforeValidate = function (params) {

        params.submitted = params.hasOwnProperty('submitted') ? params.submitted : false;

        if (!params.key && params.submitted && params.submittedBy) {
            params.provider = 'wlkthewlk';
            params.hkey = format('%s:%s', slugify(params.submittedBy), Date.now());
        }

        if (!params.hkey && params.provider && params.providerId) {
            params.hkey = format('%s:%s', params.provider, params.providerId);
        }

        if (!params.id && params.hkey) {
            params.id = keyHash(params.hkey);
        }

        if (!params.providerId && params.id) {
            params.providerId = params.id;
        }

        if (!params.providerPermalinkUrl && params.id) {
            params.providerPermalinkUrl = 'http://walkforclimate.com/#/single/' + params.id;
        }

        if (!params.providerUserUrl && params.provider) {
            if (params.provider === 'instagram') {
                params.providerUserUrl = format('https://instagram.com/', params.providerUsername);
            }
            if (params.provider === 'vine') {
                params.providerUserUrl = format('https://vine.co/u/', params.providerUserId);
            }
        }

        var isVideo = false;

        if (params.videoUrl) {
            isVideo = true;
        }

        if (isVideo) {
            if (!params.videoDimensions) {
                params.videoDimensions = {};
                params.videoDimensions.height = 480;
                params.videoDimensions.width = 480;
            }

            if (!params.videoLowUrl && params.videoUrl) {
                params.videoLowUrl = params.videoUrl;
                params.videoLowDimensions = params.videoDimensions;
            }
        }

        if (params.locationCity && params.locationState) {

            if (params.locationCountryCode === 'US') {
                params.location = format('%s, %s', params.locationCity, params.locationState);
            } else {
                params.location = format('%s, %s, %s', params.locationCity, params.locationState, params.locationCountryCode);
            }

        } else if (params.locationName) {

            params.location = params.locationName;
        }

        if (!params.providerUsername && params.submittedBy) {

            params.providerUsername = params.submittedBy;
        }

        if (!params.tags && params.submitted && params.description) {
            var hashtagRe = new RegExp('(#[a-z0-9-_]+)', 'gi');
            var hashtags = params.description.match(hashtagRe);

            if (hashtags) {
                params.tags = hashtags.map(function (val) {
                    return val.replace('#', '');
                });
            }
        }

        params.providerUserUrl = params.providerUserUrl || null;
        params.avatarUrl = params.avatarUrl || null;
        params.providerPermalinkUrl = params.providerPermalinkUrl || null;
        params.explicit = params.hasOwnProperty('explicit') ? params.explicit : false;
        params.hidden = params.hasOwnProperty('hidden') ? params.hidden : false;
        params.pending = params.hasOwnProperty('pending') ? params.pending : true;
        params.approved = params.hasOwnProperty('approved') ? params.approved : false;

        if (!params._saved && params.providerUsername) {
            if (params.provider === 'vine' &&
                params.providerUsername === 'WalkTheWalk') {

                params.approved = true;
                params.pending = false;
            }
        }
    };
};

Artifact.count = function (where, done) {
    var opts = {
        count: true
    };
    Artifact.all(where, opts, done);
};

Artifact.close = function (cb) {
    Artifact.adapter.disconnect(cb);
};

Artifact = Model.register('artifact', Artifact);

module.exports = Artifact;
