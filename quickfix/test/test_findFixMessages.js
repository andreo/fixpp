
var Rx = require('rx');
var quickfix = require('../lib/quickfix');

function makeTest(text, etalon) {
    return function (test) {
	test.expect(1);
	quickfix
	    .findFixMessages(text)
	    .toArray()
	    .subscribe(
		function (msg) {
		    test.deepEqual(msg, etalon);
		},
		function (error) {
		    throw error;
		},
		test.done);
    };
}

exports.testEmpty_emptyString = makeTest(
    "",
    []);

exports.testEmpty_MsgStart_missing = makeTest(
    "...",
    []);

exports.testEmpty_CheckSum_missing = makeTest(
    "8=...",
    []);

exports.testEmpty_MsgEnd_missing = makeTest(
    "8=...\u000110=123",
    []);

exports.testEmpty_MsgStart_missing2 = makeTest(
    "=...\u000110=123\u0001",
    []);

exports.testSimple = makeTest(
    "8=...\u000110=123\u0001",
    ["8=...\u000110=123\u0001"]);

exports.testFakeBegin1 = makeTest(
    "...8=...10=123\u00018=...\u000110=123\u0001...",
    ["8=...10=123\u00018=...\u000110=123\u0001"]);

exports.testFakeBegin2 = makeTest(
    "...8!=..\u000110=123\u00018=...\u000110=123\u0001...",
    ["8=...\u000110=123\u0001"]);

exports.testFakeEnd1 = makeTest(
    "...8=...1...10=12310=123\u0001...2...\u000110=123\u0001...",
    ["8=...1...10=12310=123\u0001...2...\u000110=123\u0001"]);

exports.testFakeEnd2 = makeTest(
    "...8=...1...10=123\u000110=123\u0001...",
    ["8=...1...10=123\u000110=123\u0001"]);

exports.testManyMessages = makeTest(
    "__8=...1...10=123\u000110=123\u0001____8=...2...10=123\u000110=123\u0001__",
    ["8=...1...10=123\u000110=123\u0001", "8=...2...10=123\u000110=123\u0001"]);
