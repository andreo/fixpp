
var util = require('util');
var log = require('winston').loggers.get('fixpp');

var request = require('./request');
var specstorage = require('./specstorage');
var nameresolver = require('./dictionarynameresolver');
var quickfix = require('quickfix');

function FixPP (Rx, config) {
    this.specstorage = specstorage(Rx, config.specpath.concat(quickfix.SPECPATH));
    this.nameResolver = nameresolver(config.dictionaryMap, 'FIX50SP2.xml');
    this.parseJSON = JSON.parse;
    this.createMessage = function () { return new quickfix.Message(); }
    this.Rx = Rx;
    // this.request = {};
}

FixPP.prototype.prettyPrint = function (req, res) {
    var r = new request.Request(req, res, this);
    // this.request[request.id] = request;
};

exports.FixPP = FixPP;
