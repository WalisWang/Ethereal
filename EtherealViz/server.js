var express = require('express');
var app = express();
var path = require('path');
var cors = require('cors')

app.use(cors())

express.static('./static')

app.use(express.static(path.join(__dirname, 'public')));

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(8080, '0.0.0.0', function() {
    console.log('Listening to port:  ' + 8080);
});