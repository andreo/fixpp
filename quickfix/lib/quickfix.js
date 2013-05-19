
var quickfix = require('../build/Release/node_quickfix.node');
var rxutil = require('rxutil');
var Rx = require('rx');

exports.loadDictionary = quickfix.loadDictionary;

exports.loadDictionaryRx = function (url) {
    return Rx.Observable.createWithDisposable(
	function (observer) {
	    var cb = rxutil.makeCallback(observer);
	    try {
		quickfix.loadDictionary(url, cb);
	    }
	    catch (error) {
		observer.onError(error);
	    }
	    return Rx.Disposable.empty;
	}
    );
};

exports.findFixMessages = function (text) {
    return Rx.Observable.createWithDisposable(
	function (observer) {
	    
	    var start = 0;
	    while (true) {
		var msgStart = text.indexOf('8=', start);
		if (msgStart === -1) break;

		var checkSum = text.indexOf('\u000110', msgStart);
		if (checkSum === -1) break;
		checkSum += 1;

		var msgEnd = text.indexOf('\u0001', checkSum);
		if (msgEnd === -1) break;
		msgEnd += 1;

		start = msgEnd;

		var fixMsg = (msgStart === 0 && msgEnd === text.length)
		    ? text
		    : text.substring(msgStart, msgEnd);

		observer.onNext(fixMsg);
	    }

	    observer.onCompleted();
	    return Rx.Disposable.empty;
	}
    );
};
