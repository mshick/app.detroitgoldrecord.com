#!/usr/local/bin/node

var argv = require('minimist')(process.argv.slice(2));

var Bcrypt = require('bcrypt'),
    Prompt = require('sync-prompt').prompt,
    Helpers = require('../lib/helpers'),
    format = require('util').format,
    secureHash = Helpers.secureHash,
    randomPassword = Helpers.randomPassword;

var pass, hash, isValid;

if (argv.password) {

    pass = argv.password;

} else {
    pass = randomPassword(12);
    var userPass = Prompt(format('Enter password to hash, or use this one [%s]: ', pass));
    pass = userPass || pass;
}

hash = secureHash(pass);
isValid = Bcrypt.compareSync(pass, hash);

console.log('Password:', pass);
console.log('Hash:', hash);
console.log('Valid:', isValid);
