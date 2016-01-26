'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/studio-center-auditions',
<<<<<<< HEAD
	domain: 'studiocenterauditions.com', // change to whatever domain you plan to use
=======
	domain: 'studiocenterauditions.com',
>>>>>>> origin/master
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/bootstrapaccessibilityplugin/plugins/css/bootstrap-accessibility.css',
				'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
				'public/lib/font-awesome/css/font-awesome.min.css'
			],
			js: [
				'public/lib/es5-shim/es5-shim.min.js',
				'public/lib/es5-shim/es5-sham.min.js',
				'public/lib/circular-json/build/circular-json.js',
				'public/lib/moment/moment.js',
				'public/lib/modernizer/modernizr.js',
				'public/lib/moment-timezone/builds/moment-timezone-with-data.min.js',
				'public/lib/angular/angular.min.js',
				'public/lib/angular-base64/angular-base64.min.js',
				'public/lib/angular-route/angular-route.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
				'public/lib/angular-moment/angular-moment.min.js',
				'public/lib/ng-file-upload/angular-file-upload-shim.min.js',
				'public/lib/ng-file-upload/angular-file-upload.js',
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-cookies/angular-cookies.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-touch/angular-touch.min.js',
				//'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/bootstrap/dist/js/bootstrap.min.js',
				//'public/lib/bootstrapaccessibilityplugin/plugins/js/bootstrap-accessibility.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
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
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
<<<<<<< HEAD
  facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
=======
	facebook: {
		clientID: process.env.FACEBOOK_ID || '848445448582782',
		clientSecret: process.env.FACEBOOK_SECRET || '9f937db4218b73809eb52ec3c43e7e12',
		callbackURL: 'http://studiocenterauditions.com/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'MJAdQiMJz13Qd5OzNo9RMVqhc',
		clientSecret: process.env.TWITTER_SECRET || 'gJRB8srQ2ipQ7aWSW120tM5XJ2OvHRfR4NhRppCzd9IDfJXiuk',
		callbackURL: 'http://studiocenterauditions.com/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '1037177876522.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'HhBkixnP1j8bFyXJ2l8srmiJ',
		callbackURL: 'http://studiocenterauditions.com/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '77fpjkn9n5c8ag',
		clientSecret: process.env.LINKEDIN_SECRET || 'PZElXXIipnGRY4rP',
		callbackURL: 'http://studiocenterauditions.com/auth/linkedin/callback'
>>>>>>> origin/master
	},
	mailer: {
		from: process.env.MAILER_FROM || 'no-reply@studiocenter.com',
		notifications: 'audition-notification@studiocenter.com',
		options: {
		    auth: {
<<<<<<< HEAD
		        api_key: 'SENDGRID_API_KEY'
=======
		        api_key: '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'
>>>>>>> origin/master
		    }
		}
	}
};
