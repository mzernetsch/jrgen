exports.populateTemplate = (template, values) => {
	var text = new String(template);

	Object.keys(values).forEach(function(key){
		var regex = new RegExp("{{" + key + "}}", "g");
		text = text.replace(regex, values[key]);
	});

	return text;
}

exports.generateRequestExample = (method, paramsSchema) => {

	var example = exports.generateExample(paramsSchema);

	var exampleRequest = {
		jsonrpc: '2.0',
		id: Math.random().toString(16).slice(2),
		method: method,
		params: example === null ? undefined : example
	}

	return JSON.stringify(exampleRequest, null, 4);
}

exports.generateResponseExample = (resultSchema) => {

	var example = exports.generateExample(resultSchema);

	var exampleResponse = {
		jsonrpc: '2.0',
		id: Math.random().toString(16).slice(2),
		result: example === null ? undefined : example
	}

	return JSON.stringify(exampleResponse, null, 4);
}

exports.generateExample = (schema) => {

	if(!schema){
		return;
	}

	var example = null;

	if(schema.type === "object"){
		example = {};

		Object.keys(schema.properties).forEach(function(key) {
			example[key] = exports.generateExample(schema.properties[key]);
		});
	}

	else if(schema.type === "array"){
		example = [exports.generateExample(schema.items)];
	}

	else {
		example = schema.example;
	}

	return example;
}
