'use strict';

//socket factory that provides the socket service
var io;
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect(location.protocol+'//'+location.host, {query: "token=my custom token", 'transports': [ 'websocket']})
        });
    }
]);
