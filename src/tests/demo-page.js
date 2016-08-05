var phantom = require('phantom');
var config = require('../config')['demo-page'];
var evaluateAssert = require('../utils').evaluateAssert;
var assert = require('assert');

module.exports = {
    run() {
        var sitepage = null;
        var phInstance = null;
        phantom.create()
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
                    sitepage.evaluate(function () {
                        (function (w) {
                            assert.ok(typeof ClientQuestionMonitorLibrary === 'undefined', 'ClientQuestionMonitorLibrary should not be undefined');
                            console.log('wawawawax');
                            // var ws = w.WebSocket("wss://" + window.document.location.host + '/');
                            // ws.send('test');
                        })(window);
                    });
                }

                // sitepage.close();
                // phInstance.exit();
            })
            .catch(error => {
                console.log(error);
                phInstance.exit();
            });
    }
};
