'use strict';
/**
 * Module dependencies.
 */
const init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	jwt = require('jwt-simple'),
	compression = require('compression'),
	redisAdapter = require('socket.io-redis');

const path = require('path');
global.appRoot = path.resolve(__dirname);

// multithreading
const cluster = require('cluster'),
	sio = require('socket.io'),
	numCPUs = require('os').cpus().length,
	sioNum = 0;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

if (cluster.isMaster) {
//  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
//
  cluster.on('exit', function(worker, code, signal) {
   console.log('worker ' + worker.process.pid + ' died, restarted');
   // start new worker
   cluster.fork();
  });

  cluster.on('fork', function (worker) {
  });

} else {

	// Bootstrap db connection
	mongoose.connect(config.db);

	// Init the express application
	var app = require('./config/express')(mongoose);

	// enable compression
	app.use(compression());

	// Set the secret for encoding/decoding JWT tokens
	app.set('jwtTokenSecret', 'studiocenter-auditions-jwt');

	// Bootstrap passport config
	require('./config/passport')();

	// Start the app by listening on <port>
	var server = app.get('server').listen(config.port);

	var io = sio(server, {cors: { origin: '*' }, upgrade: false, reconnect: true, transports: [ 'websocket', 'polling', 'flashsocket' ]});
	io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
	
	app.set('socketio', io);

	io.on('connection', (socket) => {
		console.log('a user connected');
	  
		socket.on('disconnect', ()=>{
		 console.log('a user disconnected')
		})
	  });

	app.set('server', server);

	// Listen to messages sent from the master. Ignore everything else.
	process.on('message', function(message, connection) {
		if (message !== 'sticky-session:connection') {
			return;
		}

		// Emulate a connection event on the server by emitting the
		// event with the connection the master sent us.
		server.emit('connection', connection);

		connection.resume();
	});

	// Expose app
	exports = module.exports = app;

}

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);
