angular.module('kanColleViewerMomi').factory('Port', ['$q', '$rootscope', function($q, $rootScope) {
    var Service = {};
    var callbacks = {};
    var currentCallbackId = 0;
    var ws = new WebSocket("ws://localhost:8081/kancolle/socket/");

    ws.onopen = function(){
        console.log("Socket has been opened!");
    };

    ws.onmessage = function(message){
        listener(JSON.parse(message.data));
    };

    function sendRequest(request) {
        var defer = $q.defer();
        var callback_id = getCallbackId();
        callbacks[callbackId] = {
            time: new Date(),
            cb: defer
        };
        request.callback_id = callback_id;
        console.log('Sending Request', request);
        ws.send(JSON.stringfy(request));
        return defer.promise;
    }

    function listener(data){
        var messageObj = data;
        console.log("Received data from websocket: ", messageObj);
        if(callbacks.hasOwnProperty(messageObj.callback_id)) {
            console.log(callbacks[messageObj.callback_id]);
            $rootscope.$apply(callbacks[messageObj.callback_id].cb.resolve(messageObj.data));
            delete callbacks[messageObj.callback_id];
        }
    }

    function getCallbackId(){
        currentCallbackId += 1;
        if(currentCallbackId > 10000) {
            currentCallbackId = 0;
        }
        return currentCallbackId;
    }

    return Service;
}]);
