module.exports = function (router) {
	  // Set end points
    var usersRoute = router.route('/users');
    var userRoute = router.route('/users/:id');
    var mongoose = require('mongoose');

    // Load models
    var user = require('../models/user');
    var track = require('../models/track');
    var artist = require('../models/artist');

    // Load axios
    var axios = require('axios');

    // On GET api/users(?address)
    usersRoute.get(function (req, res) {
      var address = null;
      if (req.query.address) {
        address = JSON.parse(req.query.address);
      } 
      if (address) {
        var query = {};
        query.email = address;
        mongoose.model('User').find(query, function(err, info){
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
        });
      } else {
          mongoose.model('User').find({}, function(err, users){
          if(err){
            return res.status(500).send({
              message: err,
              data: [],
            });
          }
          else{
            return res.status(200).send({
              message: 'OK',
              data: users,
            });
          }
        })
      }
    });

    // On POST api/users/(body)
    usersRoute.post(function(req, res){
      // Collect the data from body
      var userProfile = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }
      // Check if there is required fields missing
      if(userProfile.name == null || userProfile.email == null || userProfile.password == null) {
          return res.status(500).send({
            message: "Name/Email/Password field(s) are missing",
            data: [],
        });
      }
      // Create the user document
      user.create(userProfile, function(err, users) {
        if(err){
            return res.status(500).send({
              message: err,
              data: [],
          });
        }
        else{
            return res.status(201).send({
              message: 'OK',
              data: users,
          });
        }
      });
    });

    // On PUT api/users/:id(?field='lovedTracks/recentTracks/lovedArtists&method='add/del'&target='(track_url/artist_url)')
    userRoute.put(function(req, res){
      // Collect data from query
      var field = null;
      var method = null;
      var target = null;
      if (req.query.field) {
        field = JSON.parse(req.query.field);
      }
      if (req.query.method) {
        method = JSON.parse(req.query.method);
      }
      if (req.query.target) {
        target = JSON.parse(req.query.target);
      }
      // Check if there is required fields missing
      if(field == null || method == null || target == null) {
          return res.status(500).send({
            message: "Field/method/target is missing",
            data: [],
        });
      }
      // Assign options as {"url: target"}, where target is one input of the query
      var options = {};
      options.url = target;
      // If field is associated with track, update/create document for the target track under the user
      if (field === "lovedTracks" || field === "recentTracks") {
        mongoose.model('Track').find(options, '_id', function(err, info){
        	if (err) {
        		console.warn(err);
        	} else {
            if (info.length == 0) {
              // If track was not found, create a new track document and get its id
              let search_str = "/_/";
              let prefix = "https://www.last.fm/music/";
              let index = target.indexOf(search_str);
              let art = target.substring(prefix.length, index);
              let tra = target.substring(index + search_str.length);
              let url = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&artist="
              + art + "&track=" + tra + "&format=json";
              axios.get(url)
                .then(function(response){
                   let getInfo = response.data.track;
                   let trackProfile = {};
                   let old_url = getInfo.url;
                   let update_url = old_url.split('+').join(' ');
                   trackProfile.name = getInfo.name;
                   trackProfile.url = update_url;
                   if (getInfo.album) trackProfile.image = getInfo.album.image[3]['#text'];
                   trackProfile.artist = getInfo.artist.name;
                   trackProfile.artistUrl = getInfo.artist.url;
                   // Create track document for the new one
                 	 track.create(trackProfile, function(err, tracks){
             		  	 if (err) {
                       console.warn(err);
                 		 } else {
                       console.info("created_id: " + tracks["_id"]);
                       let update = setUpdate(field, method, tracks["_id"], req.params.id);
                       if (field != "recentTracks") {
                         updateDoc('User', update, req.params.id);
                       }
                     }
                 	 });
                 });
               } else {
                 // If track was found, get its id and update user's document
                 let update = setUpdate(field, method, info[0]["_id"], req.params.id);
                 if (field != "recentTracks") {
                   updateDoc('User', update, req.params.id);
                 }
               }
             }
           });
         } else if (field === "lovedArtists") {
           // If field is associated with artist, update/create document for the target artist under the user
           mongoose.model('Artist').find(options, '_id', function(err, info){
            if (err) {
              console.warn(err);
            } else {
               if (info.length == 0) {
                 // If artist was not found, create a new artist document and get its id
                 let prefix = "https://www.last.fm/music/";
                 let art = target.substring(prefix.length);
                 let url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=6c0c7ea8faab40a381fda49dcb07e8a6&artist="
                 + art + "&format=json";
                 axios.get(url)
                   .then(function(response){
                      let getInfo = response.data.artist;
                      let artistProfile = {};
                      let old_url = getInfo.url;
                      let update_url = old_url.split('+').join(' ');
                      artistProfile.name = getInfo.name;
                      artistProfile.url = update_url;
                      artistProfile.image = getInfo.image[3]['#text'];
                      artistProfile.tags = JSON.stringify(getInfo.tags.tag);
                      artistProfile.similar_artist = JSON.stringify(getInfo.similar.artist);
                      // Create track doc for the new one
                       artist.create(artistProfile, function(err, artists){
                         if (err) {
                          console.warn(err);
                         } else {
                          let update = setUpdate(field, method, artists["_id"], req.params.id);
                          updateDoc('User', update, req.params.id);
                        }
                       });
                    });
                  } else {
                    // If artist was found, get its id and update user's document
                    let update = setUpdate(field, method, info[0]["_id"], req.params.id);
                    updateDoc('User', update, req.params.id);
                  }
                }
              });

         }

      // Set the update query (except the case of when the field is recentTracks) for updating document
      var setUpdate = (field, method, id, user_id) => {
        let update = {};
        if (field === "lovedTracks") {
          if (method === "add") {
            update.$addToSet = {};
            update.$addToSet.lovedTracks = id;
          } else if (method === "del") {
            update.$pull = {};
            update.$pull.lovedTracks = id;
          } else {
            console.warn("Invalid method");
          }
        } else if (field === "recentTracks") {
          if (method === "add") {
            setUpdateRecent(id, user_id);
          } else {
            console.warn("Invalid method");
          }
        } else if (field === "lovedArtists") {
          if (method === "add") {
            update.$addToSet = {};
            update.$addToSet.lovedArtists = id;
          } else if (method === "del") {
            update.$pull = {};
            update.$pull.lovedArtists = id;
          } else {
            console.warn("Invalid method");
          }
        }

        return update;
      }

      // Set the update query in the case of when the field is recentTracks for updating document
      var setUpdateRecent = (id, user_id) => {
          let update = {};
          mongoose.model('User').findById(user_id).select('recentTracks').exec(function(err, info){
            if (err) {
              console.warn(err);
              return update;
            } else {
              if (info != null) {
                console.info("recentTracks: " + JSON.stringify(info["recentTracks"]));
                let cp_recent = info["recentTracks"];
                // If the target track has already set in the array of recentTracks
                // move it to the end of the array
                if (cp_recent.indexOf(id) > -1) {
                   cp_recent.splice(cp_recent.indexOf(id), 1);
                } else if (cp_recent.length == 10) {
                   // If the array of recentTracks has 10 elements already
                   // delete the first(oldest) track and then add the target track
                   cp_recent.splice(0, 1);
                }
                cp_recent.push(id);
                update.recentTracks = cp_recent;
                return update;
              }
            }
          }).then(function(update){
            updateDoc('User', update, req.params.id);
          });
      }

    	// Update the document
      var updateDoc = (mod, update, user_id) => {
        mongoose.model(mod).findByIdAndUpdate(user_id, update, {"new" : true}, function(err, info) {
          if(err) {
          	return res.status(500).send({
          		message: err,
          		data: [],
          	});
          } else {
      		  if(info != null) {
          		return res.status(200).send({
          			message: 'OK',
  	        		data: info,
  	        	});
      			} else {
          		return res.status(404).send({
          			message: 'Data not found',
          			data: [],
          		});
          	}
          }
        })
       }

    });

    // On GET api/users/:id?(field = 'lovedTracks'/'lovedArtists'/'recentTracks')
    userRoute.get(function(req, res){
        var field = null;
        var caseNum = 0;
        if (req.query.field) {
          field = JSON.parse(req.query.field);
        }
        if (field == null) {
          // Case 1 is to get all the information under the user's id 
          caseNum = 1;
        } else {
          // Case 2 is to get a specific field's information under the user's id
          caseNum = 2;
        }
       
        // If it is in case 1, just return the user's info
        if (caseNum === 1) {
          mongoose.model('User').findById(req.params.id, function(err, info){
          	if (err) {
          		  return res.status(500).send({
          			message: err,
          			data: [],
          		});
          	} else {
          		if (info != null) {
  	        		  return res.status(200).send({
  	        			message: 'OK',
  	        			data: info,
  	        		});
          		} else {
          			  return res.status(404).send({
          				message: 'User not found',
          				data: [],
          			});
          		}
          	}
          })
        } 

        // If it is in case 2, return info of this field under the user
        if (caseNum === 2) {
          mongoose.model('User').findById(req.params.id, field, function(err, info){
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
        }
    });

    // On DELETE api/users/:id
    userRoute.delete(function(req, res){
  	  // Check the user's id exists; if it exsits, delete it
      mongoose.model('User').findByIdAndRemove(req.params.id, function(err, users){
      	if (err) {
      		  return res.status(500).send({
      			message: err,
      			data: [],
      		});
      	} else {
      		if (users != null) {
        		  return res.status(200).send({
        			message: 'OK',
        			data: users,
        		});
      		} else {
      			  return res.status(404).send({
      				message: 'User not found',
      				data: [],
      			});
      		}
      	}
      })
    });

    return router;
}
