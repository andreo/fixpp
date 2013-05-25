
var quickfix = require('../lib/quickfix');
var Rx = require('rx');
var rxutil = require('rxutil');
rxutil.extend(Rx);
quickfix.extend(Rx);
var util = require('util');

var dd = Rx.Observable
    .loadFixDictionary('spec/FIX40.xml')
    .publishLast()
    .refCount();

var simple1 = Rx.Observable
    .readFile('test/fix_messages/simple1.fix')
    .publishLast()
    .refCount();

exports.test_emptyHeader = function (test) {
    var msg = new quickfix.Message();
    var dict = new quickfix.DataDictionary();
    msg.setStringHeader('');
    test.deepEqual([], msg.headerToJSON(dict));
    test.done();
};

exports.test_header = function (test) {
    simple1.subscribe(
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

exports.test_body = function (test) {
    Rx.Observable
	.forkJoin([dd, simple1])
	.subscribe(
	    function (data) {
		var dict = data[0];
		var text = data[1];

		var msg = new quickfix.Message();
		msg.setString(text, dict);

		var actualHeader = msg.toJSON(dict);
		var expected = [ { field: 8, value: 'FIX.4.2' },
				 { field: 9, value: '145' },
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
