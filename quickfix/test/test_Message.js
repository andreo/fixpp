
var log = require('winston').loggers.get('test_Message');
var quickfix = require('../lib/quickfix');
var Rx = require('rx');
var rxutil = require('rxutil');
rxutil.extend(Rx);
quickfix.extend(Rx);
var util = require('util');

var dataDictionary = Rx.Observable
	.loadFixDictionary('spec/FIX50SP2.xml')
	.publishLast()
	.refCount();

function testMessage (path) {
    return function (test) {
	Rx.Observable
	    .forkJoin([dataDictionary,
		       Rx.Observable.readFile(path+'.fix'),
		       Rx.Observable.readFile(path+'.json')])
	    .subscribe(function (data) {
		var dict = data[0];
		var fix = data[1];
		var expected = JSON.parse(data[2].toString());

		var msg = new quickfix.Message();
		msg.setString(fix, dict);

		var actual = msg.toJSON(dict);
		// console.log(JSON.stringify(actual, null, 4));

		test.deepEqual(actual, expected);
		test.done();
	    });
    };
}

exports.setUp = function (callback) {

    callback();
};

exports.test1 = testMessage('test/fix_messages/simple1');
exports.test2 = testMessage('test/fix_messages/fix1');
exports.test3 = testMessage('test/fix_messages/fix2');
exports.test4 = testMessage('test/fix_messages/fixml');

exports.test_emptyHeader = function (test) {
    var msg = new quickfix.Message();
    var dict = new quickfix.DataDictionary();
    msg.setStringHeader('');
    test.deepEqual([], msg.headerToJSON(dict));
    test.done();
};

exports.test_header = function (test) {
    Rx.Observable
	.readFile('test/fix_messages/simple1.fix')
	.subscribe(
	    function (text) {
		var msg = new quickfix.Message();
		var dict = new quickfix.DataDictionary();
		msg.setStringHeader(text);

		var actualHeader = msg.headerToJSON(dict);
		var expected = [ { field: 8, value: 'FIX.4.2' },
				 { field: 9, value: '146' },
				 { field: 35, value: 'D' },
				 { field: 34, value: '4' },
				 { field: 49, value: 'ABC_DEFG01' },
				 { field: 52, value: '20090323-15:40:29' },
				 { field: 56, value: 'CCG' },
				 { field: 115, value: 'XYZ' } ];

		test.deepEqual(actualHeader, expected);
		test.done();
	    });
};
