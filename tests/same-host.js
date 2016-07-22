var phantom = require('phantom');
var config = require('../config')['same-host'];

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
                return page.open(config.url);
            })
            .then(status => {
                console.log(status);
                return sitepage.property('content');
            })
            .then(content => {
                console.log(content);
                sitepage.close();
                phInstance.exit();
            })
            .catch(error => {
                console.log(error);
                phInstance.exit();
            });
    }
};