var Db = require('./database'),
    Config = require('./config.json'),
    env = process.env.NODE_ENV || 'development';

var config = Config[env] || Config['development'] || Config;

var dbConfig = config.multilevel;

dbConfig.host = process.env.HOST || dbConfig.host;
dbConfig.port = process.env.PORT || dbConfig.port;

Db.start(dbConfig);
