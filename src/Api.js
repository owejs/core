/**
 * @module owe-core/Api
 */
"use strict";

var Binding = require("./Binding");

/**
 * Represents an Api node.
 */
class Api {

	/**
	 * @param {object|Promise} object A bound object this Api should be exposing. This may also be a Promise that resolves to a bound object.
	 * @param {any[]} position The stack of routes that led to this Api pointer.
	 * @param {object} [pOrigin={}] An object to use as the origin of this Api.
	 */
	constructor(pObject, pPosition, pOrigin) {
		var pos = this[position] = (pPosition || []).slice(0);

		this[origin] = pOrigin || {};

		this[boundObject] = Promise.resolve(pObject).then(function(object) {
			if(!Binding.isBound(object))
				throw new TypeError("Object at position '" + pos.join("/") + "' is not exposed.");
			return object;
		}).catch(errorHandlers.route.bind(null, pos));
	}

	/**
	 * Setter for the origin of an Api.
	 * @param {object} value The origin object for the new Api node.
	 * @return {Api} Returns a new Api node with the given origin, that points at the same exposed object.
	 */
	origin(value) {

		if(typeof value !== "object" || value === null)
			throw new TypeError("Api origin has to be an object.");

		var clone = Object.create(this);

		clone[origin] = value;

		return clone;
	}

	/**
	 * Routes the Api according to its exposed objects routing function.
	 * @param {any} destination The destination to route to.
	 * @return {Api} A new Api for the object the routing function returned.
	 */
	route(destination) {
		var that = this,
			newPosition = this[position].concat([destination]);

		return new Api(this[boundObject].then(function(object) {
			return object[Binding.key].route(that[position], that[origin], destination);
		}), newPosition, this[origin]);
	}

	/**
	 * Closes the Api with the closing function of its exposed object.
	 * @param {any} [data=undefined] The data to close with.
	 * @return {Promise} A promise that resolves to the return value of the closing function.
	 */
	close(data) {
		var that = this;
		return this[boundObject].then(function(object) {
			return object[Binding.key].close(that[position], that[origin], data);
		}).catch(errorHandlers.close.bind(this, data));
	}

	/**
	 * Shorthand for this.close().then
	 * @param {function} success
	 * @param {function} fail
	 * @return {Promise}
	 */
	then(success, fail) {
		return this.close().then(success, fail);
	}

	/**
	 * Shorthand for this.close().catch
	 * @param {function} fail
	 * @return {function}
	 */
	catch(fail) {
		return this.close().catch(fail);
	}

	/**
	 * @return {Promise} Resolves to the exposed object this Api is pointing to.
	 */
	get object() {
		return this[object] || (this[object] = this[boundObject].then(function(object) {
			return object[Binding.key].target;
		}));
	}

}

var errorHandled = Symbol("errorHandled"),
	boundObject = Symbol("boundObject"),
	object = Symbol("object"),
	position = Symbol("position"),
	origin = Symbol("origin");

var errorHandlers = {

	route(position, err) {
		try {
			if(!(errorHandled in err)) {
				err.type = "route";
				err.location = position;
				err[errorHandled] = true;
			}
		}
		finally {
			throw err;
		}
	},

	close(data, err) {
		try {
			if(!(errorHandled in err)) {
				err.type = "close";
				err.location = this[position];
				err.data = data;
				err[errorHandled] = true;
			}
		}
		finally {
			throw err;
		}
	}
};

module.exports = Api;
