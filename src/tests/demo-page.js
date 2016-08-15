var phantom = require('phantom');
var config = require('../config')['demo-page'];
var assert = require('assert');

var flags = [
    '--local-to-remote-url-access=yes',
    '--cookies-file=cookies.txt',
    '--web-security=false',
    // '--debug=true',
    '--ignore-ssl-errors=true'
];

module.exports = {

    run() {
        var sitepage = null;
        var phInstance = null;

        return phantom.create(flags)
            .then(instance => {
                phInstance = instance;
                return instance.createPage();
            })
            .then(page => {
                sitepage = page;
                sitepage.property('onCallback', function (data) {
                    console.log(JSON.stringify(data, undefined, 4));
                });
                sitepage.property('onConsoleMessage', function (msg) { console.log(msg); });

                sitepage.property('onAlert', function (msg) {
                    console.log('alert: ' + msg);
                });

                sitepage.property('onResourceError', function (resourceError) {
                    console.log('resourceError: ', resourceError);
                });

                return sitepage.open(config.url);
            })
            .then(status => {
                console.log('page open status: ' + status);

                return sitepage.evaluate(function () {
                    return typeof ClientQuestionMonitorLibrary !== 'undefined';
                }).then((value) => {
                    return assert(value, 'ClientQuestionMonitorLibrary should not be undefined');
                });
            })
            .then(() => sitepage.evaluate(monkeyPatchClientMonitor))
            .then(() => {
                return sitepage.evaluate(function () {
                    return (function (w) {
                        return w.isClientMonitorLibraryPatched == true;
                    })(window);
                }).then(value => {
                    assert(value, 'ClientQuestionMonitorLibrary should be monkey patched');
                });
            })
            .then(() => sitepage.evaluate(sendQuestion))
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

function sendQuestion(name, from, question) {
    var time = (new Date()).getTime();
    name = (name || 'name testing ws') + ' ' + time;
    from = (from || 'from testing ws') + ' ' + time;
    question = (question || 'question testing ws') + ' ' + time;
    document.querySelector('#question_name').value = name;
    document.querySelector('#question_from').value = from;
    document.querySelector('#question_question').value = question;

    console.log('submitting a question...');
    console.log('name: ' + document.querySelector('#question_name').value);
    console.log('from: ' + document.querySelector('#question_from').value);
    console.log('question: ' + document.querySelector('#question_question').value);

    document.querySelector('#new_question-form button[type="submit"]').click();
    return true;
}

function monkeyPatchClientMonitor() {
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
}
