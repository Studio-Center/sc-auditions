'use strict';

/**
 * Module dependencies.
 */
const express = require('express'),
	http = require('http'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
	multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty(),
	nunjucks = require('nunjucks'),
	MongoStore = require('connect-mongo');

	
	
module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);
	
	const env = nunjucks.configure(['views', './app/views'], {
		autoescape: true,
		express: app
	});

	env.addFilter('is_undefined', function(obj) {
		return typeof obj === 'undefined';
	});

	env.addFilter('json', function (value, spaces) {
		if (value instanceof nunjucks.runtime.SafeString) {
			value = value.toString();
		}
		const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c');
		return nunjucks.runtime.markSafe(jsonString);
	});
	
	// Set swig as the template engine
	app.engine('server.view.html', consolidate.nunjucks);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	//app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	// app.use(bodyParser.urlencoded({
	// 	extended: true
	// }));
	// app.use(bodyParser.json());
	app.use(methodOverride());
	// set file limits
	app.use(bodyParser.json({limit: '64mb'}));
	app.use(bodyParser.urlencoded({limit: '64mb', extended: true}));

	// Enable jsonp
	app.enable('jsonp callback');

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: MongoStore.create({
            client: db.connection.getClient()
        })
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.frameguard());
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});
	
	// Attach Socket.io
	var server = http.createServer(app);
	app.set('server', server);

	return app;
};
