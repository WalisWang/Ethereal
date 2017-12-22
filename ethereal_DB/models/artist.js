var mongoose = require('mongoose');

var ArtistSchema = new mongoose.Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    image: {type: String, default: 'https://farm5.staticflickr.com/4516/38014882584_0ba29618a6_b.jpg'},
    tags: {type: String},
    similar_artist: {type: String}
});

module.exports = mongoose.model('Artist', ArtistSchema);
