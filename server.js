'use strict';
/**
 * Module dependencies.
 */
const init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	jwt = require('jwt-simple'),
	compression = require('compression'),
	url = require('url');

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

	var io = sio(server, { cors: { origin: '*' }, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000, reconnectionAttempts: 3, transports: [ 'websocket']});
	//io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

	io.on('connection', (socket) => {
		// console.log('a user connected');
		
	// 	socket.emit('projectUpdate', {id: '66059c3dc400852b320d3159'});
	// 	socket.emit('message', 'I\'m a message!');

		socket.on('projectUpdateRequest', (event)=>{
			socket.broadcast.emit('projectUpdate',{id: event.id});
			socket.broadcast.emit('clientprojectUpdate',{id: event.id});
			socket.broadcast.emit('callListUpdate', {filter: ''});
			socket.broadcast.emit('projectsListUpdate');
		});

		socket.on('talentsListUpdateRequest', (event)=>{
			socket.broadcast.emit('talentsListUpdate');
		});

		socket.on('typecastsListUpdateRequest', (event)=>{
			socket.broadcast.emit('typecastsListUpdate');
		});

		// socket.on('disconnect', (event)=>{
		//  	console.log('a user disconnected');
		// });
	});

	// override default socket upgrade listener to allow socketio connection
	let [serverUpgradeListener, socketioUpgradeListener] = server.listeners('upgrade').slice(0);
	server.removeAllListeners('upgrade');
	server.on('upgrade', (req, socket, head) => {
		const pathname = url.parse(req.url).pathname;
		if (pathname === '/socket.io/'){
			socketioUpgradeListener(req, socket, head);
		} else {
			serverUpgradeListener(req, socket, head);
			//socket.destroy();
		}
	});

	//app.set('socketio', io);
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
