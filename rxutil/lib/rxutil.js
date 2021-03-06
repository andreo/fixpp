
var fs = require('fs');
var util = require('util');
var winston = require('winston');
var logger = winston.loggers.get('rxutil');

exports.makeCallback = function (observer) {
    return function (error, data) {
	if (error) {
	    observer.onError(error);
	}
	else {
	    observer.onNext(data);
	    observer.onCompleted();
	}
    };
};

var taskId = 0;

function Logger (prefix) {
    this.startTime = new Date();
    taskId += 1;
    this.head = '[' + taskId + ']';
    if (prefix) {
	this.head += prefix + ':';
    }
}

Logger.prototype.log = function (level, message) {
    var now = new Date();
    var interval = now - this.startTime;
    logger[level].call(logger, this.head + interval + ':' + message);
};

exports.Logger = Logger;

exports.concatBuffers = function (buffers) {
    var numBuffers = buffers.length;
    if (numBuffers === 0) {
	return new Buffer(0);
    }
    else if (numBuffers === 1) {
	return buffers[0];
    }
    else {
	var resultSize = 0;
	for (var i = 0; i < numBuffers; i++) {
	    resultSize += buffers[i].length;
	}

	var result = new Buffer(resultSize);
	var offset = 0;
	for (var i = 0; i < numBuffers; i++) {
	    offset += buffers[i].copy(result, offset);
	}

	return result;
    }
};

exports.extend = function (Rx) {

    Rx.Observable.prototype.debug = function (prefix, inspect) {
	var observable = this;

	prefix = prefix || '';
	inspect = inspect || util.inspect;

	return Rx.Observable.create(
	    function (observer) {
		var logger = new Logger(prefix);
		logger.log('debug', 'subscribe');

		var disposable = observable
		    .materialize()
		    .doAction(function (data) {
			var logLevel = data.kind === 'E' ? 'error' : 'debug';
			logger.log(logLevel, inspect(data));
		    })
		    .dematerialize()
		    .subscribe(observer);

		return function () {
		    logger.log('debug', 'dispose');
		    disposable.dispose();
		};
	    });
    };

    Rx.Observable.readFile = function (filename) {
	return Rx.Observable.createWithDisposable(
	    function (observer) {
                try {
		    fs.readFile(filename, exports.makeCallback(observer));
                }
                catch (error) {
                    observer.onError(error);
                }
		return Rx.Disposable.empty;
	    });
    };

    Rx.Observable.writeFile = function (filename, data) {
	return Rx.Observable.createWithDisposable(
	    function (observer) {
                try {
		    fs.writeFile(filename, data, exports.makeCallback(observer));
                }
                catch (error) {
                    observer.onError(error);
                }
		return Rx.Disposable.empty;
	    });
    };

    Rx.Observable.prototype.toBuffer = function () {
	return this
	    .toArray()
	    .select(exports.concatBuffers);
    };

    Rx.Observable.readStream = function (stream, destroy) {
	return Rx.Observable.create(
	    function (observer) {
		stream.on('data', observer.onNext.bind(observer));
		stream.on('error', observer.onError.bind(observer));
		stream.on('end', observer.onCompleted.bind(observer));
		return destroy ? stream.destroy.bind(stream) : function () {};
	    });
    };

};
