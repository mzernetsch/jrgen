var jsonschema = require('jsonschema');

beforeEach(function() {
    jasmine.addMatchers({
        toConform: function() {
            return {
                compare: function(actual, expected) {
					var validationResult = jsonschema.validate(actual, expected);

					var pass = validationResult.errors.length === 0;
					var message = '';
					validationResult.errors.forEach(function(item){
						message += item.stack + '. value: "' + item.instance + '".\n';
					});

                    return {
						pass: pass,
                        message: message
                    }
                }
            };
        }
    });
});
