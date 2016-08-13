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
                        return typeof ClientQuestionMonitorLibrary !== 'undefined';
                    }).then((value) => {
                        return assert(value, 'ClientQuestionMonitorLibrary should not be undefined');
                    });
                }
            })
            .then(() => {
                sitepage.evaluate(function () {
                    (function (w) {
                        w.isClientMonitorLibraryPatched = undefined;
                        if (ClientQuestionMonitorLibrary) {
                            w.isClientMonitorLibraryPatched = true;
                            const oldOnMessage = ClientQuestionMonitorLibrary.onMessage;
                            ClientQuestionMonitorLibrary.onMessage = function (data) {
                                w.callPhantom({ type: 'ws-onMessage', received: data});
                                oldOnMessage.call(this, data);
                            };
                        }
                    })(window);
                });
            })
            .then(() => {
                return sitepage.evaluate(function () {
                    return (function (w) {
                        return w.isClientMonitorLibraryPatched === true;
                    })(window);
                }).then(value => {
                    assert(value, 'ClientQuestionMonitorLibrary should be monkey patched');
                });
            })
            .then(() => {
                return sitepage.evaluate(function () {
                    var time = (new Date()).getTime();
                    document.querySelector('#question_name').value = 'name testing ws ' + time;
                    document.querySelector('#question_from').value = 'from testing ws' + time;
                    document.querySelector('#question_question').value = 'testing the ws? ' + time;
                    document.querySelector('#new_question-form button[type="submit"]').click();
                });
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        reject('no ws success response');
                    }, 5000);
                });
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
