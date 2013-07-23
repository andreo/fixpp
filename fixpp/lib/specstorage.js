
var path = require('path');
var logger = require('winston').loggers.get('specstorage');

function SpecStorage (Rx, directoryList) {
    this.Rx = Rx;
    this.directoryList = directoryList;
    this.spec = {};
}

SpecStorage.prototype.findDictionary = function (name) {
    var Rx = this.Rx;

    var failoverList = this.directoryList.map(
	function (directory) {
	    var dictPath = path.join(directory, name);
	    return Rx.Observable.loadFixDictionary(dictPath);
	});
    return Rx.Observable.catchException(failoverList).first();
};

SpecStorage.prototype.load = function (name) {
    var self = this;

    return self.Rx.Observable.createWithDisposable(
	function (observer) {
	    var cache;
	    if (name in self.spec) {
		cache = self.spec[name];
	    }
	    else {
		cache = new self.Rx.AsyncSubject();
		self.spec[name] = cache;

		var sub = self
		    .findDictionary(name)
		    .subscribe(cache);
	    }
	    return cache.subscribe(observer);
	});
};

module.exports = function (Rx, directoryList) {
    return new SpecStorage(Rx, directoryList);
};
