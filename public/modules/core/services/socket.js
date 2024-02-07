'use strict';

//socket factory that provides the socket service
var io;
angular.module('core').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io($location.protocol()+"://"+$location.host()+(80!==$location.port()||443!==$location.port()?":"+$location.port():""), {reconnect: true, 'transports': ['websocket', 'polling']})
        });
    }
]);
