'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	jwt = require('jwt-simple');

// multithreading
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

 if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  // Workers can share any TCP connection
  // In this case its a HTTP server
  // http.createServer(function(req, res) {
  //   res.writeHead(200);
  //   res.end("hello world\n");
  // }).listen(8000);

	// Bootstrap db connection
	var db = mongoose.connect(config.db, function(err) {
		if (err) {
			console.error('\x1b[31m', 'Could not connect to MongoDB!');
			console.log(err);
		}
	});

	// Init the express application
	var app = require('./config/express')(db);


	// Set the secret for encoding/decoding JWT tokens
	app.set('jwtTokenSecret', 'studiocenter-auditions-jwt');

	// Bootstrap passport config
	require('./config/passport')();

	// Start the app by listening on <port>
	var server = app.listen(config.port);

	var io = require('socket.io').listen(server);

	app.set('socketio', io);
	app.set('server', server);

	// Expose app
	exports = module.exports = app;

}


// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);