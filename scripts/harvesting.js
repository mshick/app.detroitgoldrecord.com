var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone');

Backbone.$ = $;

var Setting = Backbone.Model.extend({
    urlRoot: '/api/settings/harvest',
    idAttribute: 'key'
});

var SettingsView = Backbone.View.extend({
    events: {
        'click button': 'onClickSubmit'
    },
    onClickSubmit: function (e) {
        e.preventDefault();
        var textarea = this.$el.find('textarea').get(0);
        var value = $(textarea).val();
        this.model.set('value', value);
        this.model.save();
    }
});

exports.attach = function () {
    var $tags = $('#harvest-tags');
    var model = new Setting($tags.data());

    new SettingsView({
        el: $tags,
        model: model
    });
};
