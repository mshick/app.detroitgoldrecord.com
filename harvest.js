var Harvest = require('./daemons/harvest'),
    Config = require('./config');

var env = process.env.NODE_ENV || 'development';
var config = Config[env] || Config['development'] || Config;

Harvest.start(config.harvest);
