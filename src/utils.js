'use strict';

function* entries(obj) {
   for (let key of Object.keys(obj)) {
     yield [key, obj[key]];
   }
}

function evaluateAssert(assert, message, evaluator, evaluate, params = []) {
    return assert(evaluator(evaluate, ...params), message);
}

module.exports = {
    entries,
    evaluateAssert
};
