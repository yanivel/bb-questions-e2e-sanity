'use strict';
const tests = require('./tests');
const entries = require('./utils').entries;

for (let [testName, test] of entries(tests)) {
    test.run();
}