'use strict';

module.exports = {
	db: 'mongodb://db:27017/studio-center-auditions-dev',
	app: {
		title: 'Studio Center Auditions - Development Environment'
	},
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
        mailer: {
                from: process.env.MAILER_FROM || 'no-reply@studiocenter.com',
                notifications: 'audition-notification@studiocenter.com',
                options: {
                    auth: {
                        api_key: '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'
                    }
                }
        }
};
