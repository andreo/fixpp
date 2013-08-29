
var winston = require('winston');
var log = winston.loggers.get('main');
winston.loggers.add('request',
		    {
			console: {
			    level: 'debug',
			    colorize: 'true',
			    label: 'category one'
			}
		    });

var util = require('util');
var schmock = require('schmock');
var Rx = require('rx');
var request = require('../lib/request');
var rxutil = require('rxutil');
rxutil.extend(Rx);
var quickfix = require('quickfix');
quickfix.extend(Rx);

var rt = Rx.ReactiveTest;
var onNext = rt.onNext;
var onError = rt.onError;
var onCompleted = rt.onCompleted;

exports.test_processTask_happyPath = function (test) {

    var scheduler = new Rx.TestScheduler();

    var fixMsg = '<fix-msg>';
    var jsonMsg = '<json-msg>';
    var dataDictionary = '<dict>';
    var header = '<header>';
    var dictName = '<dict-name>';

    var spec = scheduler.createColdObservable(
        onNext(10, dataDictionary),
        onCompleted(20)
    );

    var msgMock = schmock.mock('Message');
    msgMock.when('setStringHeader').with(fixMsg);
    msgMock.when('headerToJSON').with().return(header);
    msgMock.when('setString').with(fixMsg, dataDictionary);
    msgMock.when('messageToJSON').with(dataDictionary).return(jsonMsg);

    var nameResolver = schmock.mock('nameResolver');
    nameResolver.when('resolve').with(header).return(dictName);

    var specstorage = schmock.mock('specstorage');
    specstorage.when('load').with(dictName).return(spec);

    var context = {
        Rx: Rx,
        createMessage: function () { return msgMock; },
        nameResolver: nameResolver,
        specstorage: specstorage
    };

    var results = scheduler.startWithCreate(
        function () {
            return request.processTask(fixMsg, context);
        });

    test.deepEqual(results.messages,
                   [onNext(210, { fixMsg: fixMsg,
                                  dictName: dictName,
                                  json: jsonMsg
                                }),
                    onCompleted(220)]);
    test.done();
};

exports.test_processTask_fail1 = function (test) {
    var scheduler = new Rx.TestScheduler();

    var fixMsg = '<fix-msg>';
    var jsonMsg = '<json-msg>';
    var dataDictionary = '<dict>';
    var header = '<header>';
    var dictName = '<dict-name>';
    var error = new Error('fuck');

    var spec = scheduler.createColdObservable(
        onNext(10, dataDictionary),
        onCompleted(20)
    );

    var msgMock = schmock.mock('Message');
    msgMock.when('setStringHeader').with(fixMsg);
    msgMock.when('headerToJSON').with().return(header);
    msgMock.when('setString').with(fixMsg, dataDictionary);
    msgMock.when('messageToJSON').with(dataDictionary).return(jsonMsg);

    var nameResolver = schmock.mock('nameResolver');
    nameResolver.when('resolve').with(header).throw(error);

    var specstorage = schmock.mock('specstorage');
    specstorage.when('load').with(dictName).return(spec);

    var context = {
        Rx: Rx,
        createMessage: function () { return msgMock; },
        nameResolver: nameResolver,
        specstorage: specstorage
    };

    var results = scheduler.startWithCreate(
        function () {
            return request.processTask(fixMsg, context);
        });

    test.deepEqual(results.messages,
                   [onNext(200, { fixMsg: fixMsg,
                                  error: error
                                }),
                    onCompleted(200)]);
    test.done();
};

exports.test_processTask_fail2 = function (test) {

    var scheduler = new Rx.TestScheduler();

    var fixMsg = '<fix-msg>';
    var jsonMsg = '<json-msg>';
    var dataDictionary = '<dict>';
    var header = '<header>';
    var dictName = '<dict-name>';
    var error = new Error('error');

    var spec = scheduler.createColdObservable(
        onError(30, error)
    );

    var msgMock = schmock.mock('Message');
    msgMock.when('setStringHeader').with(fixMsg);
    msgMock.when('headerToJSON').with().return(header);
    msgMock.when('setString').with(fixMsg, dataDictionary);
    msgMock.when('messageToJSON').with(dataDictionary).return(jsonMsg);

    var nameResolver = schmock.mock('nameResolver');
    nameResolver.when('resolve').with(header).return(dictName);

    var specstorage = schmock.mock('specstorage');
    specstorage.when('load').with(dictName).return(spec);

    var context = {
        Rx: Rx,
        createMessage: function () { return msgMock; },
        nameResolver: nameResolver,
        specstorage: specstorage
    };

    var results = scheduler.startWithCreate(
        function () {
            return request.processTask(fixMsg, context);
        });

    test.deepEqual(results.messages,
                   [onNext(230, { fixMsg: fixMsg,
                                  dictName: dictName,
                                  error: error
                                }),
                    onCompleted(230)]);
    test.done();
};

exports.test_processTasks_emptyBuffer = function (test) {

    var scheduler = new Rx.TestScheduler();

    var buffers = scheduler.createColdObservable(
        onCompleted(20)
    );
    var context = {
        Rx: Rx,
        nameResolver: undefined,
        specstorage: undefined
    };
    var results = scheduler.startWithCreate(
        function () {
            return request.processTasks(buffers, context);
        });

    test.deepEqual(results.messages, [onError(220, new Error('Unexpected end of input'))]);
    test.done();
};

exports.test_processTasks_emptyMessage = function (test) {

    var scheduler = new Rx.TestScheduler();

    var buffers = scheduler.createColdObservable(
        onNext(10, new Buffer('{"message":"","separator": ""}')),
        onCompleted(20)
    );
    var context = {
        Rx: Rx,
        parseJSON: JSON.parse,
        nameResolver: undefined,
        specstorage: undefined
    };
    var results = scheduler.startWithCreate(
        function () {
            return request.processTasks(buffers, context);
        });

    test.deepEqual(results.messages, [onCompleted(220)]);
    test.done();
};

exports.test_processTasks_happyPath = function (test) {

    var scheduler = new Rx.TestScheduler();

    var fixMsg = '8=...\u000110=123\u0001';
    var fixRequest = JSON.stringify({"message": fixMsg, "separator": ""});
    // var fixRequest = '{ "message": "", "separator": "" }';
    JSON.parse(fixRequest);
    var jsonMsg = '<json-msg>';
    var dataDictionary = '<dict>';
    var header = '<header>';
    var dictName = '<dict-name>';

    var buffers = scheduler.createColdObservable(
        onNext(10, new Buffer(fixRequest)),
        onCompleted(30)
    );

    var spec = scheduler.createColdObservable(
        onNext(10, dataDictionary),
        onCompleted(20)
    );

    var msgMock = schmock.mock('Message');
    msgMock.when('setStringHeader').with(fixMsg);
    msgMock.when('headerToJSON').with().return(header);
    msgMock.when('setString').with(fixMsg, dataDictionary);
    msgMock.when('messageToJSON').with(dataDictionary).return(jsonMsg);

    var nameResolver = schmock.mock('nameResolver');
    nameResolver.when('resolve').with(header).return(dictName);

    var specstorage = schmock.mock('specstorage');
    specstorage.when('load').with(dictName).return(spec);

    var context = {
        Rx: Rx,
        createMessage: function () { return msgMock; },
        nameResolver: nameResolver,
        specstorage: specstorage,
        parseJSON: JSON.parse
    };

    var results = scheduler.startWithCreate(
        function () {
            return request.processTasks(buffers, context);
        });

    test.deepEqual(results.messages,
                   [onNext(240, { fixMsg: fixMsg,
                                  dictName: dictName,
                                  json: jsonMsg
                                }),
                    onCompleted(250)]);
    test.done();
};
