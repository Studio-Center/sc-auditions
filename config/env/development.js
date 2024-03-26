'use strict';

module.exports = {
        db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/studio-center-auditions-dev',
        app: {
                title: 'Studio Center Auditions - Development Environment'
        },
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
                                'public/lib/tinymce/tinymce.js',
                                'public/lib/moment-timezone/builds/moment-timezone-with-data.min.js',
                                'public/lib/angular/angular.js',
                                'public/lib/angular-base64/angular-base64.min.js',
                                'public/lib/angular-route/angular-route.min.js',
                                'public/lib/angular-sanitize/angular-sanitize.min.js',
                                'public/lib/angular-moment/angular-moment.min.js',
                                'public/lib/ng-file-upload/angular-file-upload-shim.min.js',
                                'public/lib/ng-file-upload/angular-file-upload.js',
                                'public/lib/jquery/dist/jquery.min.js',
                                'public/lib/jquery-migrate/jquery-migrate.min.js',
                                'public/lib/jquery-color/jquery.color.js',
                                'public/lib/angular-resource/angular-resource.min.js',
                                'public/lib/angular-cookies/angular-cookies.min.js',
                                'public/lib/angular-animate/angular-animate.min.js',
                                'public/lib/angular-touch/angular-touch.min.js',
                                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                                'public/lib/bootstrap/dist/js/bootstrap.min.js',
                                'public/lib/angular-ui-utils/ui-utils.min.js',
                                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                                'public/lib/ngAudio/app/angular.audio.js',
                                'public/lib/angular-encode-uri/dist/angular-encode-uri.min.js',
                                'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
                                'public/lib/textAngular/dist/textAngularSetup.js',
                                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                                'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                                'public/lib/angular-ui-tinymce/src/tinymce.js',
                                'public/lib/textAngular/dist/textAngular.min.js',
                                'public/lib/socket.io-client/dist/socket.io.js',
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
                ]
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
