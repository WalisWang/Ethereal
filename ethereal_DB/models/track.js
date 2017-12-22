var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    image: {type: String, default: "https://farm5.staticflickr.com/4543/37899630425_80554453a7_h.jpg"},
    artistUrl: {type: String, default: ""},
    artist: {type: String, default: ""},
});

module.exports = mongoose.model('Track', TrackSchema);
