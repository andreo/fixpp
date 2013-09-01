define(
    ["./InputForm"],
    function (InputForm) {
        return new InputForm.Model({
            separator: "sep",
            message: "msg",
            persistent: true
        });
    });
