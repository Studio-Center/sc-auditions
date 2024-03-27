'use strict';

//socket factory that provides the socket service
var io;
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io('wss://'+location.host, {reconnect: true, 'transports': ['echo-protocol','websocket']})
        });
    }
]);
