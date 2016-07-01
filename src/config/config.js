var nconf = require('nconf');
var src = process.cwd() + '/src/';

nconf.argv()
    .env()
    .file({
        file: src + 'config/config.json'
    });

module.exports = nconf;