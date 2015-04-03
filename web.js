require("consoleplusplus");

var Config = require('./config.json'),
    Server = require('./lib').server,
    env = process.env.NODE_ENV || 'development';

var config = Config[env] || Config['development'] || Config;

if (env === 'production') {
    console.setLevel(console.LEVELS['WARN']);
} else {
    console.enableMessageColor();
    console.disableLevelMsg();
    console.disableTimestamp();
    console.setLevel(console.LEVELS['DEBUG']);
}

Server.start(config);
