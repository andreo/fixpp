define(
    [
	'underscore'
    ],
    function (_) {

	function BuildPlainText(message) {
	    this.strings = [];
	    this.offsetStep = ".   ";
	    this.write('<pre class="plain-text">');
	    this.writeMessage("", message);
	    this.write('</pre>');
	    this.resultString = this.strings.join('');
	}

	var proto = BuildPlainText.prototype;

	proto.result = function () {
	    return this.resultString;
	};

	proto.write = function (string) {
	    this.strings.push(string);
	};

	proto.writeMessage = function (offset, message) {
	    var newOffset = offset + this.offsetStep;

	    this.write(offset + 'Head\n');
	    this.writeFields(newOffset, message.header);

	    this.write(offset + 'Body\n');
	    this.writeFields(newOffset, message.body.fields);
	    this.writeGroups(newOffset, message.body.groups);

	    this.write(offset + 'Trailer\n');
	    this.writeFields(newOffset, message.trailer);
	};

	proto.writeFields = function (offset, fields) {
	    if (fields === undefined) {
		return;
	    }
	    for (var i = 0; i < fields.length; i++) {
		this.writeField(offset, fields[i]);
	    }
	};

	proto.writeField = function (offset, field) {
	    var name = field.name
		? field.name + ' (' + field.field + ')'
		: field.field;
	    var value = field.enum
		? field.enum + ' (' + field.value + ')'
		: _.escape(field.value);
	    this.write(offset + name + ' = ' + value + '\n');
	};

	proto.writeGroups = function (offset, groups) {
	    if (groups === undefined) {
		return;
	    }
	    for (var i = 0; i < groups.length; i++) {
		this.writeGroup(offset, groups[i]);
	    }
	};

	proto.writeGroup = function (offset, group) {
	    this.write(offset + group.groupName + ' (' + group.groupField + ')\n');
	    this.writeFields(offset + this.offsetStep, group.fields);
	    this.writeGroups(offset + this.offsetStep, group.groups);
	};

	return function (message) {
	    return (new BuildPlainText(message)).result();
	};
    });
