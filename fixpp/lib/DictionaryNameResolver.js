var FIX_SEPARATOR = String.fromCharCode(1);

function DictionaryNameResolver (config, defaultName) {
    this.config = [];
    this.defaultName = defaultName;

    for (var key in config) {
        this.config.push({
            regexp: new RegExp(key),
            name: config[key]
        });
    }
}

DictionaryNameResolver.prototype.getSessionID = function (header) {
    return header.beginString + ":" + header.senderCompID + "->" + header.targetCompID;
};

DictionaryNameResolver.prototype.resolve = function (header) {
    var sessionID = this.getSessionID(header);

    for (var i = 0; i<this.config.length; i++) {
        var current = this.config[i];
        if (current.regexp.test(sessionID)) {
            return current.name;
        }
    }
    return this.defaultName;
};

module.exports = function (config, defaultName) {
    return new DictionaryNameResolver(config, defaultName);
};
