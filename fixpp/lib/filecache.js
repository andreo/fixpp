var log = require('winston').loggers.get('filecache');
var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');

function FileCache (dir, Rx) {
    this.dir = dir;
    this.Rx = Rx;
}

FileCache.prototype.onError = function (error) {
    log.error(util.inspect(error));
};

var RegHash = /^[0-9a-f]{40}$/i;

FileCache.prototype.makeFileName = function (key) {
    if (!RegHash.test(key)) {
        return this.Rx.Observable.throwException("wrong hash: " + key);
    }
    else {
        return this.Rx.Observable.returnValue(path.join(this.dir, key));
    }
};

FileCache.prototype.put = function (key, value) {
    var self = this;
    return this
        .makeFileName(key)
        .selectMany(function (fileName) {
            return self.Rx.Observable
                .wirteFile(fileName, value)
                .select(function () {
                    var shasum = crypto.createHash('sha1');
                    shasum.update(value);
                    return shasum.digit('hex');
                });
        });
};

FileCache.prototype.get = function (key) {
    var self = this;
    return this
        .makeFileName(key)
        .selectMany(function (fileName) {
            return self.Rx.Observable
                .readFile(fileName)
                .toBuffer()
                .select(JSON.parse);
            });
};

function makeHash (data) {
    var shasum = crypto.createHash('sha1');
    shasum.update(data);
    log.debug(util.inspect(shasum.__proto__));
    return shasum.digest('hex');
}

FileCache.prototype.save = function (value) {

    var str = JSON.stringify(value);
    var key = makeHash(str);

    return this.Rx.Observable
        .writeFile(this.makeFileName(key), str)
        .select(function () { return key; });
};

exports.FileCache = FileCache;
