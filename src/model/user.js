var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

/**
 * User
 */
var User = new Schema({
    local: {
        username: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        username: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        username: String
    }
});

User.virtual('userId')
    .get(function () {
        return this.id;
    });


/**
 * Generating a hash
 * @param password
 * @returns {*}
 */
User.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Checking if password is valid
 * @param password
 * @returns {*}
 */
User.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);
