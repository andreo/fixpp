
var util = require('util');
var log = require('winston').loggers.get('fixpp');

var request = require('./request');
var specstorage = require('./specstorage');
var nameresolver = require('./dictionarynameresolver');
var quickfix = require('quickfix');

function FixPP (Rx, cache, config) {
    this.cache = cache;
    this.specstorage = specstorage(Rx, config.specpath.concat(quickfix.SPECPATH));
    this.nameResolver = nameresolver(config.dictionaryMap, 'FIX50SP2.xml');
    this.parseJSON = JSON.parse;
    this.createMessage = function () { return new quickfix.Message(); }
    this.Rx = Rx;
    // this.request = {};
}

FixPP.prototype.handleStatic = function (req, res) {
    var hash = req.params.hash;
    this.cache
        .get(hash)
        .select(function (data) {
            return {
                hash: hash,
                persistent: true,
                data: data
            };
        })
        .subscribe(this.onData.bind(this, res),
                   this.onError.bind(this, res),
                   function () {});
}

FixPP.prototype.prettyPrint = function (req, res) {
    var self = this;
    request
        .handleRequest(req, this)
        .debug('request')
        .selectMany(function (state) {
            if (state.jsonReq.persistent === true) {
                return self.cache
                    .save(state.data)
                    .debug('cache')
                    .select(function (hash) {
                        state.hash = hash;
                        return state;
                    });
            }
            else {
                return self.Rx.Observable.returnValue(state);
            }
            
        })
        .subscribe(this.onData.bind(this, res),
                   this.onError.bind(this, res),
                   function () {});

};

FixPP.prototype.onData = function (res, state) {
    res.json({ status: "ok",
               hash: state.hash,
               persistent: state.persistent,
               data: state.data
             });
};

FixPP.prototype.onError = function (res, error) {
    log.error(util.inspect(error));
    res.json({ status: "error", error: util.inspect(error)});
};

exports.FixPP = FixPP;
