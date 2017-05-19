it("should handle '{{METHOD}}' requests.", (done) => {

  var methodConfig = config.methods['{{METHOD}}'];

  request('{{METHOD}}', methodConfig.params)
    .then((result) => {

      if (methodConfig.expectError) {
        fail("Expected error, got result. Result: " + JSON.stringify(result, null, 4));
        done();
        return;
      }

      expect(result).toConform({
        {
          RESULT_SCHEMA
        }
      });
      done();
    })
    .catch((error) => {

      if (!methodConfig.expectError) {
        fail("Expected result, got error. Error: " + JSON.stringify(error, null, 4));
        done();
        return;
      }

      done();
    });
});
