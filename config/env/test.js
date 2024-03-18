'use strict';

module.exports = {
	db: 'mongodb://127.0.0.1:27017/studio-center-auditions-test',
	port: 3001,
	app: {
		title: 'Studio Center Auditions - Test Environment'
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
	},
	mailer: {
        from: process.env.MAILER_FROM || 'no-reply@studiocenter.com',
        notifications: 'audition-notification@studiocenter.com',
        options: {
                auth: {
                        api_key: ''
                }
        }
  },
	TWILIO: {
		  ACCOUNT_SID: '',
		  AUTH_TOKEN: '',
		  ACCOUNT_SUBACCOUNT_SID: ''
	}
};