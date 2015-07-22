"use strict";

const Api = require("./Api"),
	Binding = require("./Binding"),
	State = require("./State");

const resourceMap = new WeakMap();

function owe(object, router, closer, type) {

	// An object of the form { router:[function], closer:[function] } can be used as well:
	if(router != null && typeof router === "object") {

		if(closer !== undefined && arguments.length === 3) {
			type = closer;
			closer = undefined;
		}
		else if(closer !== undefined)
			throw new TypeError("Invalid binding functions.");
		closer = router.closer;
		router = router.router;
	}

	router = router == null ? function() {} : router;
	closer = closer == null ? function() {} : closer;

	if(type !== undefined && typeof type !== "symbol") {

		if(typeof type === "object" && type !== null && "valueOf" in type)
			type = type.valueOf();

		if(typeof type === "string")
			type = Binding.types[type];
		else if(typeof type === "boolean")
			type = type ? Binding.types.clone : Binding.types.normal;
		else
			throw new TypeError("Invalid binding type.");
	}

	return Binding.bind(object, router, closer, type);
}

owe.api = function api(object, router, closer, type) {
	if(!Binding.isBound(object) || arguments.length > 1)
		object = owe(object, router, closer, type);

	return new Api(object);
};

owe.isApi = function isApi(api) {
	return api instanceof Api;
};

owe.resource = function resource(object, data) {
	if((typeof object !== "object" || object === null) && typeof object !== "function" || resourceMap.has(object))
		throw new TypeError("Could not transform given object into a resource.");

	if(typeof object !== "object" || object === null)
		throw new TypeError("Resource data has to be an object.");

	resourceMap.set(object, data);

	return object;
};

owe.resourceData = function resourceData(object) {
	return resourceMap.get(object) || {};
};

owe.State = State;

owe.Binding = Binding;
owe.isBound = Binding.isBound.bind(Binding); // kek.

module.exports = owe;
