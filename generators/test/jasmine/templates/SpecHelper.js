var jsonschema = require("jsonschema");

beforeEach(() => {
  jasmine.addMatchers({
    toConform: () => {
      return {
        compare: (actual, expected) => {
          var validationResult = jsonschema.validate(actual, expected);

          var pass = validationResult.errors.length === 0;
          var message = "";
          validationResult.errors.forEach(item => {
            message += item.stack + '. value: "' + item.instance + '".\n';
          });

          return {
            pass: pass,
            message: message
          };
        }
      };
    }
  });
});
