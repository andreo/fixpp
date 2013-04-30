
var rxutil = require('../lib/rxutil');

exports.test_zero = function (test) {
    test.strictEqual(
	'',
	rxutil.concatBuffers([]).toString());
    test.done();
};

exports.test_one = function (test) {
    test.strictEqual(
	'123',
	rxutil.concatBuffers([new Buffer('123')]).toString());
    test.done();
};

exports.test_many = function (test) {
    test.strictEqual(
	'1234567890',
	rxutil.concatBuffers([new Buffer('123'), new Buffer(''), new Buffer('4567890'), new Buffer('')]).toString());
    test.done();
};
