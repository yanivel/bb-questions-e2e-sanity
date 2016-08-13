'use strict';
const tests = require('./tests');
const entries = require('./utils').entries;

for (let [testName, test] of entries(tests)) {
    test.run().then(error => {
        if (!error) {
            console.log(testName + ' passed!');
        } else {
            console.log(testName + ' failed:');
            console.log(error);
        }
    });
}
