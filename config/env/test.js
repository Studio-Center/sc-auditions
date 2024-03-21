'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/studio-center-auditions-test',
	port: 3001,
	app: {
		title: 'Studio Center Auditions - Test Environment'
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