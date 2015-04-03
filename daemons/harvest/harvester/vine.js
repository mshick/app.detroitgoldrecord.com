var Path = require('path'),
    Util = require('util'),
    Harvester = require('./base'),
    format = Util.format;

function Vine(options) {
    Harvester.call(this, options);

    this.name = 'vine';
    this.baseUrl = 'https://api.vineapp.com/timelines/tags';
    this.pageSize = 50;
    this.jsonPath = 'data.records.*';
    this.jsonFilter = null;
}

Vine.prototype = new Harvester();
Vine.constructor = Vine;

Vine.prototype.getUrl = function (tagName, backAnchor) {

    var url = format('%s/%s?size=%d', this.baseUrl, tagName, this.pageSize);

    if (backAnchor) {
        url = format('%s&backAnchor=%s', url, backAnchor);
    }

    return url;
};

Vine.prototype.conform = function (data) {
    var item = {};

    if (!data.videoUrl) {
        return;
    }

    // Basic Id
    item.type = 'video';
    item.provider = 'vine';
    item.providerId = Path.basename(data.shareUrl);

    // Basic Basic
    item.createdAt = new Date(data.created);
    item.providerPermalinkUrl = data.shareUrl;

    // User
    item.providerUsername = data.username;
    item.providerUserId = data.userId.toString();
    item.providerUserUrl = 'https://vine.co/u/' + item.providerUsername;
    item.avatarUrl = data.avatarUrl;

    // 480x480 Thumb
    item.thumbnailUrl = data.thumbnailUrl;
    item.thumbnailDimensions = {};
    item.thumbnailDimensions.width = 480;
    item.thumbnailDimensions.height = 480;

    // 480x480 Video
    item.videoUrl = data.videoUrl;
    item.videoDimensions = {};
    item.videoDimensions.width = 480;
    item.videoDimensions.height = 480;

    // 480x480 Video (low)
    item.videoLowUrl = data.videoLowURL;
    if (!item.videoLowUrl) {
        item.videoLowUrl = item.videoUrl;
    }
    item.videoLowDimensions = {};
    item.videoLowDimensions.width = 480;
    item.videoLowDimensions.height = 480;

    // Content
    item.description = data.description;
    item.tags = data.entities.map(function (entity) {
        if (entity.type === 'tag') {
            return entity.title;
        }
    });

    item.explicit = (data.explicitContent === 1);

    if (data.venueName) {
        item.locationName = data.venueName;
    }
    if (data.venueCity) {
        item.locationCity = data.venueCity;
    }
    if (data.venueState) {
        item.locationState = data.venueState;
    }
    if (data.venueCountryCode) {
        item.locationCountryCode = data.venueCountryCode;
    }

    if (item.locationCity && item.locationState) {

        if (item.locationCountryCode === 'US') {
            item.location = format('%s, %s', item.locationCity, item.locationState);
        } else {
            item.location = format('%s, %s', item.locationCity, item.locationState, item.locationCountryCode);
        }

    } else if (item.locationName) {

        item.location = item.locationName;
    }

    item.submitted = false;

    return item;
};

Vine.prototype.pager = function (jsonRoot, options) {
    var url,
        result,
        anchor,
        data;

    result = {};
    data = jsonRoot.data;
    url = this.getUrl(options.tagName);

    // Going backward...
    if (!options.backAnchor) {

        anchor = data.anchorStr;
        if (data.nextPage) {
            result.nextUrl = format('%s&anchor=%s', url, anchor);
        }
        // Upper bound
        result.backAnchor = data.backAnchor;
    }

    // Going forward!
    if (options.backAnchor) {

        anchor = data.backAnchor;
        if (data.previousPage) {
            result.nextUrl = format('%s&backAnchor=%s', url, anchor);
        }
        result.backAnchor = anchor;
    }

    // Going nowhere!
    if (options.backAnchor) {
        result.backAnchor = options.backAnchor;
    }

    return result;
};

module.exports = Vine;
