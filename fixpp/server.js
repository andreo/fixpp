
var winston = require('winston');
var log = winston.loggers.get('server');
var express = require('express');
var fs = require('fs');
var util = require('util');
var Rx = require('rx');
var request = require('./lib/request');
request.extend(Rx);
var quickfix = require('quickfix');
quickfix.extend(Rx);
var rxutil = require('rxutil');
rxutil.extend(Rx);
var fixpp = require('./lib/fixpp');
var filecache = require('./lib/filecache');

var config = require(process.env.CONFIG || __dirname + "/config.json");

var httpLogger = express.logger(
    {
	format: ':remote-addr - - [:date][:response-time ms] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	stream: fs.createWriteStream(config.logFile, { flags: 'a' })
    });

var cache = new filecache.FileCache('/Users/andreo/trash/cache/', Rx);
var fixpp = new fixpp.FixPP(Rx, cache, config);

function days(n) {
    return 0;//1000*3600*24*n;
}

var app = express()
    .use(express.compress())
    .use(httpLogger)
    .use(express.static(__dirname + '/public', { maxAge: days(3) }))
    .post('/fixpp', fixpp.prettyPrint.bind(fixpp))
    .get('/fixmessage/:hash', fixpp.handleStatic.bind(fixpp));

var host = process.env.HOST || config.host || 'localhost';
var port = process.env.PORT || config.port || 3000;

app.listen(port, host, function () {
    var url = 'http://' + host + ':' + port + '/';
    log.info(url);
});
