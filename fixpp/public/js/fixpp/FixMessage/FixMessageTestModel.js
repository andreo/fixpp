define(
    ['./FixMessage', 'fixpp/TestModel'],
    function (FixMessage, Message) {
	return new FixMessage.Model({
            dictionary: 'FIX50SP2',
            message: Message
        });
    });
