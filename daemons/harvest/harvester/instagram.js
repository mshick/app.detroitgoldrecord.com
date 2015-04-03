var Hoek = require('hoek'),
    Util = require('util'),
    Harvester = require('./base'),
    reach = Hoek.reach,
    format = Util.format;

function Instagram(options) {

    Hoek.assert(options.settings.clientId, 'Instagram required a Client ID');
    Harvester.call(this, options);

    this.name = 'instagram';
    this.clientId = options.settings.clientId;
    this.baseUrl = 'https://api.instagram.com/v1/tags';
    this.pageSize = 50;
    this.jsonPath = 'data.*';
    // this.jsonFilter = 'video';
}

Instagram.prototype = new Harvester();
Instagram.constructor = Instagram;

Instagram.prototype.getUrl = function (tagName, backAnchor) {

    var url = format('%s/%s/media/recent?client_id=%s&count=%d', this.baseUrl, tagName, this.clientId, this.pageSize);

    if (backAnchor) {
        url = format('%s&min_tag_id=%s', url, backAnchor);
    }

    return url;
};

Instagram.prototype.conform = function (data) {
    var item = {};

    // Basic Id
    item.type = 'artifact';
    item.provider = 'instagram';
    item.providerId = data.id.toString();

    // Basic Basic
    item.createdAt = new Date(parseInt(data.created_time, 10) * 1000);
    item.providerPermalinkUrl = data.link;

    // User
    item.providerUsername = reach(data, 'user.username');
    item.providerUserId = reach(data, 'user.id');
    item.providerUserUrl = 'https://instagram.com/' + item.providerUsername;
    item.avatarUrl = reach(data, 'user.profile_picture');

    // 480x480 Thumb
    item.thumbnailUrl = reach(data, 'images.low_resolution.url');
    item.thumbnailDimensions = {};
    item.thumbnailDimensions.width = reach(data, 'images.low_resolution.width');
    item.thumbnailDimensions.height = reach(data, 'images.low_resolution.height');

    // 480x480 Image
    item.imageUrl = reach(data, 'images.standard_resolution.url');
    item.imageDimensions = {};
    item.imageDimensions.width = reach(data, 'images.standard_resolution.width');
    item.imageDimensions.height = reach(data, 'images.standard_resolution.height');

    if (reach(data, 'videos.standard_resolution.url')) {
        // 480x480 Video
        item.videoUrl = reach(data, 'videos.standard_resolution.url');
        item.videoDimensions = {};
        item.videoDimensions.width = reach(data, 'videos.standard_resolution.width');
        item.videoDimensions.height = reach(data, 'videos.standard_resolution.height');

        // 480x480 Video (low)
        item.videoLowUrl = reach(data, 'videos.low_resolution.url');
        if (!item.videoLowUrl) {
            item.videoLowUrl = item.videoUrl;
        }
        item.videoLowDimensions = {};
        item.videoLowDimensions.width = reach(data, 'videos.low_resolution.width');
        item.videoLowDimensions.height = reach(data, 'videos.low_resolution.height');
    }

    // Content
    item.description = reach(data, 'caption.text');
    item.tags = data.tags;

    item.explicit = (data.explicitContent === 1);

    if (data.location) {
        item.locationName = reach(data, 'location.name');
        item.locationCoordinates = {};
        item.locationCoordinates.latitude = reach(data, 'location.latitude');
        item.locationCoordinates.longitude = reach(data, 'location.longitude');

        // TODO: Add in geo lookup
    }

    if (item.locationName) {
        item.location = item.locationName;
    }

    item.submitted = false;

    return item;
};

Instagram.prototype.pager = function (jsonRoot, options) {

    var url,
        result,
        page;

    result = {};
    page = jsonRoot.pagination;

    // Going back...
    if (!options.backAnchor) {

        if (page.next_url) {
            result.nextUrl = page.next_url;
        }
        result.backAnchor = page.min_tag_id;
    }

    // Going forward!
    if (options.backAnchor && page.min_tag_id) {

        url = this.getUrl(options.tagName, page.min_tag_id);
        result.nextUrl = url;
        result.backAnchor = page.min_tag_id;
    }

    // Going nowhere!
    if (options.backAnchor) {
        result.backAnchor = options.backAnchor;
    }

    return result;
};

module.exports = Instagram;
