module.exports = function (router) {

    // Set end points
    var artistsRoute = router.route('/artists');
    var artistRoute = router.route('/artists/:id');
    var mongoose = require('mongoose');

    // Load model
    var artist = require('../models/artist');

    // On GET api/artists
    artistsRoute.get(function (req, res) {
      mongoose.model('Artist').find({}, function(err, artists){
        if(err){
          return res.status(500).send({
            message: err,
            data: [],
          });
        }
        else{
          return res.status(200).send({
            message: 'OK',
            data: artists,
          });
        }
      })
    });

    // On GET api/artists/:id(+ id+ id+ id...)
    artistRoute.get(function(req, res){
      var query = req.params.id.split("+");
      mongoose.model('Artist').find({ _id: { $in: query } }, function(err, info){
        if (err) {
          return res.status(500).send({
          message: err,
          data: [],
         });
        } else {
          return res.status(200).send({
          message: 'OK',
          data: info,
         });
        }
      })
    });

    // On DELETE api/artists/:id(+ id+ id+ id...)
    artistRoute.delete(function(req, res){
      var query = req.params.id.split("+");
      mongoose.model('Artist').find( { _id: { $in: query } } ).remove(function(err, artists){
        if (err) {
            return res.status(500).send({
            message: err,
            data: [],
          });
        } else {
          if (artists != null) {
              return res.status(200).send({
              message: 'OK',
              data: artists,
            });
          } else {
              return res.status(404).send({
              message: 'Track not found',
              data: [],
            });
          }
        }
      })
    });

    return router;
}
