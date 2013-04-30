
var Rx = require('rx');
var rxutil = require('../lib/rxutil.js');
rxutil.extend(Rx);

function makeTest(expected, array) {
    return function (test) {
	test.expect(1);
	Rx.Observable
	    .fromArray(array)
	    .toBuffer()
	    .subscribe(
		function (buffer) {
		    test.strictEqual(expected, buffer.toString());
		},
		function (error) {
		    throw error;
		},
		function () {
		    test.done();
		});
    };
};

exports.test_zero = makeTest('', []);
exports.test_one = makeTest('1', [ new Buffer('1') ]);
exports.test_many = makeTest('1234', [ new Buffer('1'), new Buffer('234'), new Buffer('') ]);
