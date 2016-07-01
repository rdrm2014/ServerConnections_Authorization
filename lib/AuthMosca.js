var request = require('unirest');

var src = process.cwd() + '/src/';
var config = require(src + 'config/config');

function AuthMosca() {
}

AuthMosca.prototype.authenticate = function () {
    return function (client, username, password, callback) {
        request.post(config.get('authentication:uri') + ':' + config.get('authentication:port') + '/api/services/info')
            .header('Authorization', 'Bearer ' + password)
            .end(function (response) {
                console.log("client: " + client);
                console.log("username: " + username);
                console.log("password: " + password);



                var data = response.body;

                if (data == "Unauthorized"){
                    console.log("data: " + response.body);
                    callback(null, false);
                } else{
                    callback(null, true);
                }

                //if ((data.name == username)) {
                //    client.channels = data.channels;
                //    //console.log("client.channels: " + client.channels);
                //    return true;
                //} else {
                //    console.log('\x1b[36m', 'ERRORERRORERRORERRORERRORERRORERROR', '\x1b[0m');
                //    console.log('\x1b[36m', data, '\x1b[0m');
                //    return false;
                //}
            });
    }
};

AuthMosca.prototype.authorizePublish = function () {
    return function (client, topic, payload, callback) {
        callback(null, true);
        /*
         if (client.channels != null) {
         if (client.channels.indexOf(topic) != -1) {
         callback(null, true);
         } else {
         console.log('\x1b[36m', client, '\x1b[0m');
         callback(null, false);
         }
         } else {
         callback(null, false);
         }*/
    }
};

AuthMosca.prototype.authorizeSubscribe = function () {
    return function (client, topic, callback) {
        callback(null, true);
        /*
         if (client.channels != null) {
         if (client.channels.indexOf(topic) != -1) {
         callback(null, true);
         } else {
         console.log('\x1b[36mXXXXXXX', topic, '\x1b[0m');
         callback(null, false);
         }
         } else {
         callback(null, false);
         }*/
    }
};

module.exports = AuthMosca;
