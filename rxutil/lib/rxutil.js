
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

Logger.prototype.info = function (message) {
    this.log('info', message);
};

Logger.prototype.error = function (message) {
    this.log('error', message);
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