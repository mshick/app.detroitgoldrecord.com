var Minimist = require('minimist'),
    Van = require('van');

var argv,
    opts,
    van,
    webProc;

argv = Minimist(process.argv.slice(2));

opts = {
    scripts: []
};

opts.scripts = [];
opts.scripts.push('node db.js');

if (argv.dev) {
    opts.scripts.push('./node_modules/.bin/nodemon web.js');
    opts.scripts.push('./node_modules/.bin/gulp');
}

else if (argv.init) {
    opts.scripts.push('INIT_NEW=true node web.js');
}

else {
    opts.scripts.push('node harvest.js');
    opts.scripts.push('node web.js');
}

van = new Van(opts);

van.start();

// Provide the web process with stdin
webProc = van.passengers[1].proc;
process.stdin.pipe(webProc.stdin);

process.on('SIGINT', function () {
    // send a kill signal to each child process
    van.stop();
});
