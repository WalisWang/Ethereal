// Connect all the endpoints 
module.exports = function (app, router) {
    app.use('/api', require('./home.js')(router));
    app.use('/api/users', require('./users.js')(router));
    app.use('/api/tracks', require('./tracks.js')(router));
    app.use('/api/artists', require('./artists.js')(router));
};
