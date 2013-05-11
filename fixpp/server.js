
var express = require('express');
var fs = require('fs');
var util = require('util');
var winston = require('winston');
var logger = winston.loggers.get('fixpp');

var httpLogger = express.logger(
    {
	format: ':remote-addr - - [:date][:response-time ms] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	stream: fs.createWriteStream('/Users/andreo/trash/logs/fixpp.log', { flags: 'a' })
    });

var app = express()
    .use(httpLogger)
    .use(express.static(__dirname + '/public'));

var host = 'localhost';
var port = 1234;

app.listen(port, host, function () {
    var url = 'http://' + host + ':' + port + '/';
    logger.info(url);
});
