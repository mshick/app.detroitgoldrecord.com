var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone');

Backbone.$ = $;
Backbone.BootstrapModal = require('backbone.bootstrap-modal');

var Videos,
    Video,
    VideoView;

// Models
Video = Backbone.Model.extend({
    urlRoot: '/api/artifacts',
    defaults: {
        'approved': false,
        'hidden': false,
        'pending': true
    }
});

// Collections
Videos = Backbone.Collection.extend({
    model: Video,
    url: '/api/artifacts'
});

var createModal = function (model) {
    if (window.modal) {
        window.modal.close();
        window.modal.remove();
    }

    var viewOpts = {};
    viewOpts.model = model;
    viewOpts.template = window.modalTemplate;

    var view = new VideoView(viewOpts);

    var modal = new Backbone.BootstrapModal({
        content: view,
        showFooter: false
    }).open();

    var $dialog = modal.$el.find('.modal-dialog');

    $dialog.on('click', function (e) {
        e.stopPropagation();
    });

    modal.$el.one('click', function () {
        modal.close();
        modal.remove();
    });

    window.modal = modal;
};

// Views
VideoView = Backbone.View.extend({

    playing: false,

    events: {
        'click .video-play': 'onClickPlay',
        'click video': 'onClickPlay',
        'click .approve': 'onClickApprove',
        'click .reject': 'onClickReject'
    },

    initialize: function (options) {
        options = options || {};

        if (options.template) {
            this.template = _.template(options.template);
        }

        this.listenTo(this.model, 'change:approved change:pending', this.modelChange);
        this.render();
    },
    modelChange: function () {
        this.render();
    },
    render: function (selector) {
        if (this.template) {

            var html = this.template(this.model.attributes);
            this.$el.html(html);

        } else {
            var $el = this.$el,
                model = this.model;
            if (model.get('approved')) {
                $el.addClass('approved');
                $el.removeClass('rejected');
            } else {
                $el.removeClass('approved');
                if (!model.get('pending')) {
                    $el.addClass('rejected');
                }
            }
            if (model.get('explicit')) {
                $el.addClass('explicit');
            }
        }

        return this;
    },
    togglePlay: function () {
        var video = this.$el.find('video').get(0);
        if (!this.playing) {
            this.$el.addClass('playing');
            video.play();
            this.playing = true;
        } else {
            this.$el.removeClass('playing');
            video.pause();
            this.playing = false;
        }
    },
    onClickPlay: function (e) {
        if (e) e.preventDefault();
        this.togglePlay();
    },
    onClickReject: function (e) {
        if (e) e.preventDefault();
        this.model.set('approved', false);
        this.model.set('pending', false);
        this.model.save();
        if (window.modal) {
            window.modal.close();
            window.modal.remove();
        }
    },
    onClickApprove: function (e) {
        if (e) e.preventDefault();
        this.model.set('approved', true);
        this.model.set('pending', false);
        this.model.save();
        if (window.modal) {
            window.modal.close();
            window.modal.remove();
        }
    }
});

var VideoViewExpand = VideoView.extend({
    initialize: function (options) {
        _.extend(this.events, { 'click .expand': 'onClickExpand' });
        options = options || {};

        if (options.template) {
            this.template = _.template(options.template);
        }

        this.listenTo(this.model, 'change:approved change:pending', this.modelChange);
        this.render();
    },
    onClickExpand: function (e) {
        if (e) e.preventDefault();
        var self = this;
        var fetch = this.model.fetch();

        if (this.playing) {
            this.togglePlay();
        }

        fetch.done(function () {
            createModal(self.model);
        });
    }
});

var VideoViewReplace = VideoView.extend({
    initialize: function (options) {
        options = options || {};
        this.template = _.template(window.modalTemplate);
    },
    getNew: function() {
        var self = this;
        var fetch = $.ajax('/api/artifacts?limit=1&offset=3&orderBy=createdAt&sort=desc&format=false&filters=pending|true');
        fetch.done(function(data) {
            var model = new Video(data);
            self.model = model;
            self.render();
        });
    },
    onClickReject: function (e) {
        var self = this;
        if (e) e.preventDefault();
        this.model.set('approved', false);
        this.model.set('pending', false);
        var saved = this.model.save();
        if (saved) {
            saved.done(function () {
                self.getNew();
            });
        }
    },
    onClickApprove: function (e) {
        var self = this;
        if (e) e.preventDefault();
        this.model.set('approved', true);
        this.model.set('pending', false);
        var saved = this.model.save();
        if (saved) {
            saved.done(function () {
                self.getNew();
            });
        }
    },
    render: function () {
        var html = this.template(this.model.attributes);
        var tmp = $(html);
        var $videoEl = this.$el.find('video');
        var $captionEl = this.$el.find('.caption');
        $videoEl.replaceWith(tmp[0]);
        $captionEl.replaceWith(tmp[2]);
        return this;
    }
});


function vivifyVideos() {

    var path = window.location.pathname;
    var videos = new Videos();

    function vivify() {
        var $el,
            itemData,
            model;

        $el = $(this);
        itemData = $el.data();
        model = videos.add(itemData);

        var viewReplace,
            viewExpand;

        if (path === '/admin') {
            viewReplace = new VideoViewReplace({
                el: $el,
                model: model
            });
        } else {
            viewExpand = new VideoViewExpand({
                el: $el,
                model: model
            });
        }
    }

    $('.thumb-grid')
        .find('.thumb-grid-item')
        .each(vivify);
}

exports.attach = vivifyVideos;
