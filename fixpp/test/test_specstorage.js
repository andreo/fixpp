
var Rx = require('rx');
var specstorage = require('../lib/specstorage');
var rxutil = require('rxutil');
rxutil.extend(Rx);
var winston = require('winston');
var logger = winston.loggers.get('fixpp');

var rt = Rx.ReactiveTest;

function makeTest (conf) {
    return function (test) {
        var scheduler = new Rx.TestScheduler();
        Rx.Observable.loadFixDictionary = function (path) {
            // logger.debug(conf.eventMap);
            // logger.debug(path);
            if (path in conf.eventMap) {
                return scheduler.createColdObservable(conf.eventMap[path]);
            }
            else {
                // logger.error('file "'+ path + '" not found');
                return Rx.Observable.throwException(new Error('file "'+ path + '" not found'));
            }
        };

        var results = scheduler.startWithCreate(
            function () {
                return specstorage(Rx, conf.pathList).load(conf.dictName);
            });

        test.deepEqual(results.messages, conf.expectedEventList);
        test.done();
    };
}

exports.test_first = makeTest(
    {
        dictName: 'name1.xml',
        pathList: ['path1'],
        eventMap: {
            'path1/name1.xml': [
                rt.onNext(10, { type: 'dictionary', name: 'name1' }),
                rt.onCompleted(15)
            ]
        },
        expectedEventList: [
            rt.onNext(210, { type: 'dictionary', name: 'name1' }),
            rt.onCompleted(210)
        ]
    }
);

exports.test_second = makeTest(
    {
        dictName: 'name1.xml',
        pathList: ['path1', 'path2'],
        eventMap: {
            'path2/name1.xml': [
                rt.onNext(10, { type: 'dictionary', name: 'path2/name1.xml' }),
                rt.onCompleted(15)
            ]
        },
        expectedEventList: [
            rt.onNext(210, { type: 'dictionary', name: 'path2/name1.xml' }),
            rt.onCompleted(210)
        ]
    }
);

exports.test_emptyPathList = makeTest(
    {
        dictName: 'name1.xml',
        pathList: [],
        eventMap: {},
        expectedEventList: [
            rt.onError(200, new Error('sequence contain no elements'))
        ]
    }
);

exports.test_failoverSucceeded = makeTest(
    {
        dictName: 'name1.xml',
        pathList: ['path1', 'path2'],
        eventMap: {
            'path1/name1.xml': [
                rt.onError(10, new Error('load error'))
            ],
            'path2/name1.xml': [
                rt.onNext(10, { type: 'dictionary', name: 'path2/name1.xml' }),
                rt.onCompleted(15)
            ]
        },
        expectedEventList: [
            rt.onNext(220, { type: 'dictionary', name: 'path2/name1.xml' }),
            rt.onCompleted(220)
        ]
    }
);

exports.test_failoverFailed = makeTest(
    {
        dictName: 'name1.xml',
        pathList: ['path1', 'path2', 'path3'],
        eventMap: {
            'path1/name1.xml': [
                rt.onError(10, new Error('error1'))
            ],
            'path2/name1.xml': [
                rt.onError(10, new Error('error2'))
            ],
            'path3/name1.xml': [
                rt.onError(10, new Error('error3'))
            ]
        },
        expectedEventList: [
            rt.onError(230, new Error('error3'))
        ]
    }
);

exports.test_cache = function (test) {
    var scheduler = new Rx.TestScheduler();
    var observable = scheduler.createColdObservable(
        [
            rt.onNext(20, 'dictionary'),
            rt.onCompleted(30)
        ]);

    Rx.Observable.loadFixDictionary = function (path) {
        return observable;
    };

    var ss = specstorage(Rx, ['p1']);

    var ob1 = scheduler.createObserver();
    scheduler.scheduleAbsolute(
        100,
        function () {
            ss.load('d1').subscribe(ob1);
        });

    var ob2 = scheduler.createObserver();
    scheduler.scheduleAbsolute(
        200,
        function () {
            ss.load('d1').subscribe(ob2);
        });

    scheduler.start();

    test.deepEqual(
        ob1.messages,
        [
            rt.onNext(120, 'dictionary'),
            rt.onCompleted(120)
        ]);

    test.deepEqual(
        ob2.messages,
        [
            rt.onNext(200, 'dictionary'),
            rt.onCompleted(200)
        ]);

    test.deepEqual(
        observable.subscriptions,
        [
            rt.subscribe(100, 120)
        ]);

    test.done();
};
