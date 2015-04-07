#!/usr/local/bin/node

var argv = require('minimist')(process.argv.slice(2));

var Bcrypt = require('bcrypt'),
    prompt = require('prompt'),
    Helpers = require('../lib/helpers'),
    format = require('util').format,
    secureHash = Helpers.secureHash,
    randomPassword = Helpers.randomPassword;

var password, hash, isValid;

function done(pword) {
    pword = pword || password;
    hash = secureHash(pword);
    isValid = Bcrypt.compareSync(pword, hash);

    console.log('Password:', pword);
    console.log('Hash:', hash);
    console.log('Valid:', isValid);
}

if (argv.password) {

    done(argv.password);

} else {

    password = randomPassword(12);

    prompt.start();

    prompt.message = format('Enter password to hash, or use this one [%s]:', password);
    prompt.delimiter = '';

    prompt.get([{ name: 'password', message: ' ' }], function (err, result) {
        done(result.password);
    });
}


