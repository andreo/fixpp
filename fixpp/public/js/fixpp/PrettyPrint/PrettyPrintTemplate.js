var templates = [
    "fix_field_list_template",
    "fix_field_template",
    "fix_gorup_template",
    "fix_group_list_template",
    "fix_message_template",
];

var dependencies = templates.map(
    function (name) {
	return "text!./templates/" + name + ".html";
    });

var deps = ["handlebars"].concat(dependencies);

define(
    ["handlebars"].concat(dependencies),
    function (Handlebars) {
	var args = arguments;
	
	templates.forEach(
	    function (name, i) {
		var text = args[i+1];
		var template = Handlebars.compile(text);
		Handlebars.registerHelper(name,
					  function (data) {
					      return new Handlebars.SafeString(template(data));
					  });
	    });

	return Handlebars.helpers['fix_message_template'];
    });
