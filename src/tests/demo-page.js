var phantom = require('phantom');
var config = require('../config')['demo-page'];
var assert = require('assert');

module.exports = {

    run() {
        var sitepage = null;
        var phInstance = null;
        return phantom.create()
            .then(instance => {
                phInstance = instance;
                return instance.createPage();
            })
            .then(page => {
                sitepage = page;
                sitepage.property('onInitialized', function () {
                    sitepage.evaluate(function () {
                        console.log('onInitialized');
                        (function (w){
                            console.log('wawa');
                            // var oldWS = w.WebSocket;
                            // w.WebSocket = function (uri) {
                            //     this.ws = new oldWS(uri);
                            // };
                            // w.WebSocket.prototype.send = function (msg) {
                            //     w.callPhantom({type: "ws", sent: "msg"});
                            //     this.ws.send(msg);
                            // };
                            // console.log(w.WebSocket);
                        })(window);
                    });
                });
                sitepage.property('onCallback', function (data) {
                    console.log(JSON.stringify(data, undefined, 4));
                });
                sitepage.property('onConsoleMessage', function (msg) { console.log(msg); });

                return sitepage.open(config.url);
            })
            .then(status => {
                if (status === 'success') {
                    console.log(status);

                    return sitepage.evaluate(function () {
                        return typeof ClientQuestionMonitorLibrary === 'undefined';
                    }).then((value) => {
                        assert(value, 'ClientQuestionMonitorLibrary should not be undefined');
                    });
                }
            })
            .then(() => {
                sitepage.close();
                phInstance.exit();
                return false;
            })
            .catch(error => {
                phInstance.exit();
                return error;
            });
    }
};
