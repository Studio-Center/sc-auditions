'use strict';

module.exports = {
	app: {
		title: 'Studio Center Auditions',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/bootstrapaccessibilityplugin/plugins/css/bootstrap-accessibility.css',
				'public/lib/soundmanager/demo/demo/play-mp3-links/css/inlineplayer.css',
				'public/lib/soundmanager/demo/flashblock/flashblock.css',
				'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
				'public/lib/font-awesome/css/font-awesome.min.css'
			],
			js: [
				'public/lib/moment/moment.js',
				'public/lib/moment-timezone/moment-timezone-with-data.min.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-route/angular-route.min.js',
				'public/lib/angular-moment/angular-moment.min.js',
				'public/lib/ng-file-upload-shim/angular-file-upload-shim.min.js',
				'public/lib/ng-file-upload/angular-file-upload.min.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				//'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/bootstrap/dist/js/bootstrap.min.js',
				'public/lib/bootstrapaccessibilityplugin/plugins/js/bootstrap-accessibility.min.js', 
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/ngAudio/app/angular.audio.js',
				'public/lib/angular-encode-uri/dist/angular-encode-uri.min.js',
				'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
				'public/lib/textAngular/dist/textAngularSetup.js',
				'public/lib/textAngular/dist/textAngular-rangy.min.js',
				'public/lib/textAngular/dist/textAngular-sanitize.min.js',
				'public/lib/textAngular/dist/textAngular.min.js',
				'public/lib/socket.io-client/socket.io.js',
				'public/lib/angular-socket-io/socket.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};