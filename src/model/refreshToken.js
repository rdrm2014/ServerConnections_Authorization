var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * RefreshToken
 */
var RefreshToken = new Schema({
    //userId: {
    //    type: Schema.Types.ObjectId,
    //    ref: 'User',
    //    required: true
    //},
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    priceStrategy: [String],
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RefreshToken', RefreshToken);