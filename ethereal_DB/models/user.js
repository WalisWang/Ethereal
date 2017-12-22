var mongoose = require('mongoose');
var ObjectId = require('mongoose').Schema.ObjectId

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, default: '', required: true},
    lovedTracks: {type: [String]},
    recentTracks: {type: [String]},
    lovedArtists: {type: [String]},
    image: {type: String, default: "https://farm5.staticflickr.com/4543/37899630425_80554453a7_h.jpg"}
});

module.exports = mongoose.model('User', UserSchema);
