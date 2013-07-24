
var winston = require('winston');
var log = winston.loggers.get('server');
var express = require('express');
var fs = require('fs');
var util = require('util');
var Rx = require('rx');
var quickfix = require('quickfix');
quickfix.extend(Rx);
var rxutil = require('rxutil');
rxutil.extend(Rx);
var fixpp = require('./lib/fixpp');

var httpLogger = express.logger(
    {
	format: ':remote-addr - - [:date][:response-time ms] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	stream: fs.createWriteStream('/Users/andreo/trash/logs/fixpp.log', { flags: 'a' })
    });

var config = require(process.env.CONFIG || __dirname + "/config.json");
var fixpp = new fixpp.FixPP(Rx, config);

var app = express()
    .use(httpLogger)
    .use(express.static(__dirname + '/public'))
    .post('/fixpp', fixpp.prettyPrint.bind(fixpp));

var host = process.env.HOST || config.host || 'localhost';
var port = process.env.PORT || config.port || 3000;

app.listen(port, host, function () {
    var url = 'http://' + host + ':' + port + '/';
    log.info(url);
});
