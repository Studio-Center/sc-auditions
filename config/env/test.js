'use strict';

module.exports = {
	db: 'mongodb://localhost/studio-center-auditions-test',
	port: 3001,
	app: {
		title: 'Studio Center Auditions - Test Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '848445448582782',
		clientSecret: process.env.FACEBOOK_SECRET || '9f937db4218b73809eb52ec3c43e7e12',
		callbackURL: 'http://dev.studiocenterauditions.com/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'MJAdQiMJz13Qd5OzNo9RMVqhc',
		clientSecret: process.env.TWITTER_SECRET || 'gJRB8srQ2ipQ7aWSW120tM5XJ2OvHRfR4NhRppCzd9IDfJXiuk',
		callbackURL: 'http://dev.studiocenterauditions.com/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '1037177876522.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'HhBkixnP1j8bFyXJ2l8srmiJ',
		callbackURL: 'http://dev.studiocenterauditions.com/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || '77fpjkn9n5c8ag',
		clientSecret: process.env.LINKEDIN_SECRET || 'PZElXXIipnGRY4rP',
		callbackURL: 'http://dev.studiocenterauditions.com/auth/linkedin/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};