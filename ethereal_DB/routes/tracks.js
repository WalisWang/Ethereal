module.exports = function (router) {
    // Set end points
    var tracksRoute = router.route('/tracks');
    var trackRoute = router.route('/tracks/:id');
    var mongoose = require('mongoose');

    // Load model
    var track = require('../models/track');
    
    // Load axios
    var axios = require('axios');

    // On GET api/tracks
    tracksRoute.get(function (req, res) {
      mongoose.model('Track').find({}, function(err, tracks){
        if (err) {
            return res.status(500).send({
            message: err,
            data: [],
          });
        } else {
            return res.status(200).send({
            message: 'OK',
            data: tracks,
          });
        }
      })
    });

    // On GET api/tracks/:id(+ id+ id+ id...)
    trackRoute.get(function(req, res){
      var query = req.params.id.split("+");
      mongoose.model('Track').find({ _id: { $in: query } }, function(err, info){
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

    // On DELETE api/tracks/:id(+ id+ id+ id...)
    trackRoute.delete(function(req, res){
      var query = req.params.id.split("+");
      mongoose.model('Track').find( { _id: { $in: query } } ).remove(function(err, tracks){
      	if (err) {
      		  return res.status(500).send({
      			message: err,
      			data: [],
      		});
      	} else {
      		if (tracks != null) {
        		  return res.status(200).send({
        			message: 'OK',
        			data: tracks,
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
