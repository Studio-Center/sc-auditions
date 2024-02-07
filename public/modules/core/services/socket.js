'use strict';

//socket factory that provides the socket service
var io;
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        console.log(location.host);
        return socketFactory({
            prefix: '',
            ioSocket: io(location.host, {reconnect: true, 'transports': ['websocket', 'polling']})
        });
    }
]);
