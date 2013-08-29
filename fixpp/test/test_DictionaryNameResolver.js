
var DictionaryNameResolver = require('../lib/dictionarynameresolver');

exports.setUp = function (callback) {
    this.resolver = DictionaryNameResolver(
        {
            'begin:sender1->target1': 'name1',
            'begin:sender2->target1': 'name2',
            'begin:.*->target1': 'name3'
        },
        'defaultName');
    callback();
};

function makeTest(header, expectedName) {
    return function (test) {
        var name = this.resolver.resolve(header);
        test.equal(expectedName, name);
        test.done();
    };
}

exports.test_1 = makeTest(
    {
        beginString: "begin",
        senderCompID: "sender1",
        targetCompID: "target1"
    },
    'name1');

exports.test_2 = makeTest(
    {
        beginString: "begin",
        senderCompID: "sender2",
        targetCompID: "target1"
    },
    'name2');

exports.test_3 = makeTest(
    {
        beginString: "begin",
        senderCompID: "XXX",
        targetCompID: "target1"
    },
    'name3');

exports.test_4 = makeTest(
    {},
    'defaultName');
