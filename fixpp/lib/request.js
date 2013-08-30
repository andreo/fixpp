var util = require('util');
var specstorage = require('./specstorage');
var log = require('winston').loggers.get('request');

var FIX_SEPARATOR = String.fromCharCode(1);

function normalizeSeparators (jsonReq) {
    jsonReq.message = (0 < jsonReq.separator.length)
        ? jsonReq.message.split(jsonReq.separator).join(FIX_SEPARATOR)
        : jsonReq.message;
};
exports.normalizeSeparators = normalizeSeparators;

function processTask(fixMsg, context) {
    // assert.strictEqual(typeof fixMsg, "string");
    return context.Rx.Observable.createWithDisposable(
        function (observer) {
            var task = {
                fixMsg: fixMsg
            };
            try {
                var msg = context.createMessage();
                msg.setStringHeader(fixMsg);
                var header = msg.headerToJSON();
                task.dictName = context.nameResolver.resolve(header);

                return context.specstorage
                    .load(task.dictName)
                    .select(function (dict) {
                        msg.setString(fixMsg, dict);
                        task.json = msg.messageToJSON(dict);
                        return task;
                    })
                    .subscribe(
                        observer.onNext.bind(observer),
                        function (error) {
                            task.error = error;
                            observer.onNext(task);
                            observer.onCompleted();
                        },
                        observer.onCompleted.bind(observer)
                    );
            }
            catch (error) {
                task.error = error;
                observer.onNext(task);
                observer.onCompleted();
                return context.Rx.Disposable.empty;
            }
        }
    );
}
exports.processTask = processTask;

exports.extend = function (Rx) {

    var proto = Rx.Observable.prototype;

    proto.parseRequest = function (context) {
        return this
	    .toBuffer()
            .select(function (buffer) {
                var jsonReq = context.parseJSON(buffer.toString());
                normalizeSeparators(jsonReq);
                return jsonReq;
            });
    };

    proto.processTasks = function (context) {
        return this
            .selectMany(function (jsonReq) {
                return context.Rx.Observable
                    .findFixMessages(jsonReq.message)
                    .selectMany(function (fixMsg) {
                        return processTask(fixMsg, context);
                    });
            });
    };

};

function Request (req, res, context) {
    var self = this;

    self.req = req;
    self.res = res;
    self.context = context;

    self.cancel = context.Rx.Observable
        .readStream(req)
        .parseRequest(context)
        .doAction(function (jsonReq) { self.jsonReq = jsonReq; })
        .processTasks(context)
        .doAction(function (data) { data.error && data.error = util.inspect(data.error); })
        .toArray()
        .debug('processTasks')
        .subscribe(self.onData.bind(this),
                   self.onError.bind(this),
                   function () {});
}

Request.prototype.onData = function (data) {
    this.res.json({ status: "ok", data: data });
};

Request.prototype.onError = function (error) {
    log.error(util.inspect(error));
    this.res.json({ status: "error", error: util.inspect(error)});
};

exports.Request = Request;
