
var request = require('../lib/request');

function makeTest(expected, req) {
    return function (test) {
        request.normalizeSeparators(req)
        test.equal(req.message, expected);
        test.done();
    };
}

exports.test_emptyString = makeTest(
    "",
    {
        message: "",
        separator: "A^"
    });

exports.test_singleSeparator = makeTest(
    "\u0001",
    {
        message: "A^",
        separator: "A^"
    });

exports.test_twoSeparators = makeTest(
    "\u0001\u0001",
    {
        message: "A^A^",
        separator: "A^"
    });

exports.test_simple = makeTest(
    "\u0001hello\u0001world\u0001",
    {
        message: "A^helloA^worldA^",
        separator: "A^"
    });

exports.test_emptySeparator = makeTest(
    "hello",
    {
        message: "hello",
        separator: ""
    });
