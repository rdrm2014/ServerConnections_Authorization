var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Service
 */
var Service = new Schema({
    //userId: {
    //    type: Schema.Types.ObjectId,
    //    ref: 'User',
    //    required: true
    //},
    name: {
        type: String,
        unique: true,
        required: true
    },
    serviceSecret: {
        type: String,
        required: true
    },
    priceStrategy: [String],
    urlCallback: {
        type: String,
        required: true
    }
});

Service.virtual('serviceId')
 .get(function () {
 return this.id;
 });

module.exports = mongoose.model('Service', Service);
