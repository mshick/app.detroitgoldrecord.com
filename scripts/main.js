var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('backbone');

global.window._ = _;
global.window.jQuery = global.window.$ = $;
global.window.Backbone = Backbone;
global.window.$.ajaxSetup({
    cache: false
});

Backbone.$ = $;

var Artifacts = require('./artifacts');
var Harvesting = require('./harvesting');

function main() {

    var path = window.location.pathname;

    if (path === '/admin' ||
        path === '/admin/artifacts' ||
        path === '/admin/submissions') {

        Artifacts.attach();
    }

    if (path === '/admin/harvesting') {

        Harvesting.attach();
    }
}

main();
