
var winston = require('winston');
winston.loggers.add('rxutil',
		    {
			console: {
			    level: 'debug',
			    colorize: 'true',
			    label: 'category one'
			}
		    });

var nodemock = require('nodemock');
var Rx = require('rx');
var rxutil = require('../lib/rxutil');
rxutil.extend(Rx);

exports.setUp = function (callback) {
    this.data = {};
    this.error = {};
    this.end = {};

    this.stream = nodemock
	.mock('on').takes('data', function () {}).ctrl(1, this.data)
	.mock('on').takes('error', function () {}).ctrl(1, this.error)
	.mock('on').takes('end', function () {}).ctrl(1, this.end)
	.mock('destroy');

    callback();
};

exports.test_onNext = function (test) {
    var observer = nodemock
	.mock('onNext').takes(100);

    var streamRx = Rx.Observable.readStream(this.stream, true);
    var sub = streamRx.subscribe(observer);

    this.data.trigger(100);
    sub.dispose();

    this.stream.assert();
    observer.assert();
    test.done();
};

exports.test_onError = function (test) {
    var observer = nodemock
	.mock('onError').takes('error message');

    var streamRx = Rx.Observable.readStream(this.stream, true);
    var sub = streamRx.subscribe(observer);

    this.error.trigger('error message');
    sub.dispose();

    this.stream.assert();
    observer.assert();
    test.done();
};

exports.test_onCompleted = function (test) {
    var observer = nodemock
	.mock('onCompleted').takes();

    var streamRx = Rx.Observable.readStream(this.stream, true);
    var sub = streamRx.subscribe(observer);

    this.end.trigger();
    sub.dispose();

    this.stream.assert();
    observer.assert();
    test.done();
};

