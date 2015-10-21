/* jshint mocha: true */

"use strict";

const expect = require("expect.js");

const owe = require("../src");
const Api = require("../src/Api");

describe("owe", function() {

	it("should have a reference to Binding", function() {
		expect(owe.Binding).to.be(require("../src/Binding"));
	});

	it("should have a reference to Binding.isBound", function() {
		expect(owe.isBound).to.be.a("function");
	});

	it("should have a reference to State", function() {
		expect(owe.State).to.be(require("../src/State"));
	});

	describe(".call()", function() {
		it("should return the given object", function() {
			const o = {};

			expect(owe(o, function() {}, function() {})).to.be(o);
		});

		it("should bind the given object", function() {
			const o = owe({}, function() {}, function() {});

			expect(owe.isBound(o)).to.be.ok();
		});

		it("should return a new bound object if none was given", function() {
			const o = owe(null, function() {}, function() {});

			expect(o).to.be.an("object");
			expect(owe.isBound(o)).to.be.ok();
		});

		it("should use the given routing and closing functions for binding", function() {
			const a = function() {};
			const b = function() {};

			const binding = owe.Binding.getBinding(owe({}, a, b));

			expect(binding.router).to.be(a);
			expect(binding.closer).to.be(b);
		});

		it("should accept router and closer wrapped in an object", function() {
			const a = function() {};
			const b = function() {};

			const binding = owe.Binding.getBinding(owe({}, {
				router: a,
				closer: b
			}));

			expect(binding.router).to.be(a);
			expect(binding.closer).to.be(b);
		});

		it("should throw if router and closer are wrapped in an object and a closer is given as third param", function() {
			expect(() => owe.Binding.getBinding(owe({}, {
				router: function() {},
				closer: function() {}
			}, function() {}))).to.throwError();

			expect(() => owe.Binding.getBinding(owe({}, {
				router: function() {}
			}, function() {}))).to.throwError();

			expect(() => owe.Binding.getBinding(owe({}, {
				closer: function() {}
			}, function() {}))).to.throwError();
		});

		it("should accept a missing router and/or closer and use empty functions instead", function() {
			const binding1 = owe.Binding.getBinding(owe({}, {}));

			expect(binding1.router).to.be.a("function");
			expect(binding1.closer).to.be.a("function");

			const a = function() {};
			const binding2 = owe.Binding.getBinding(owe({}, {
				router: a,
				closer: null
			}));

			expect(binding2.router).to.be(a);
			expect(binding2.closer).to.be.a("function");

			const binding3 = owe.Binding.getBinding(owe({}));

			expect(binding1.router).to.be.a("function");
			expect(binding1.closer).to.be.a("function");

			const binding4 = owe.Binding.getBinding(owe({}, a));

			expect(binding4.router).to.be(a);
			expect(binding4.closer).to.be.a("function");

			const binding5 = owe.Binding.getBinding(owe({}, undefined, a));

			expect(binding5.router).to.be.a("function");
			expect(binding5.closer).to.be(a);
		});

		it("should use another Binding type identifier if given as last param", function() {
			const binding1 = owe.Binding.getBinding(owe({}, {}, "clone"));

			expect(binding1.type).to.be(owe.Binding.types.clone);

			const binding2 = owe.Binding.getBinding(owe({}, {}, "rebind"));

			expect(binding2.type).to.be(owe.Binding.types.rebind);

			const binding3 = owe.Binding.getBinding(owe({}, {
				router: function() {}
			}, "normal"));

			expect(binding3.type).to.be(owe.Binding.types.normal);

			const binding4 = owe.Binding.getBinding(owe({}, undefined, undefined, "clone"));

			expect(binding1.type).to.be(owe.Binding.types.clone);

			const binding5 = owe.Binding.getBinding(owe({}, function() {}, function() {}, "clone"));

			expect(binding1.type).to.be(owe.Binding.types.clone);
		});

		it("should use another Binding type symbol if given as last param", function() {
			const binding1 = owe.Binding.getBinding(owe({}, {}, owe.Binding.types.clone));

			expect(binding1.type).to.be(owe.Binding.types.clone);

			const binding2 = owe.Binding.getBinding(owe({}, {}, owe.Binding.types.rebind));

			expect(binding2.type).to.be(owe.Binding.types.rebind);

			const binding3 = owe.Binding.getBinding(owe({}, {
				router: function() {}
			}, owe.Binding.types.normal));

			expect(binding3.type).to.be(owe.Binding.types.normal);

			const binding4 = owe.Binding.getBinding(owe({}, undefined, undefined, owe.Binding.types.clone));

			expect(binding1.type).to.be(owe.Binding.types.clone);

			const binding5 = owe.Binding.getBinding(owe({}, function() {}, function() {}, owe.Binding.types.clone));

			expect(binding1.type).to.be(owe.Binding.types.clone);
		});

		it("should use Binding type clone if type param is true, normal if false", function() {
			const binding1 = owe.Binding.getBinding(owe({}, {}, true));

			expect(binding1.type).to.be(owe.Binding.types.clone);

			const binding2 = owe.Binding.getBinding(owe({}, {}, false));

			expect(binding2.type).to.be(owe.Binding.types.normal);
		});

		it("should throw if the given Binding type is invalid", function() {
			expect(() => owe({}, {}, null)).to.throwError();
			expect(() => owe({}, undefined, undefined, null)).to.throwError();
			expect(() => owe({}, {}, NaN)).to.throwError();
			expect(() => owe({}, undefined, undefined, NaN)).to.throwError();
			expect(() => owe({}, {}, 0)).to.throwError();
			expect(() => owe({}, undefined, undefined, 0)).to.throwError();
			expect(() => owe({}, {}, "")).to.throwError();
			expect(() => owe({}, undefined, undefined, "")).to.throwError();
			expect(() => owe({}, {}, "toString")).to.throwError();
			expect(() => owe({}, undefined, undefined, "toString")).to.throwError();
			expect(() => owe({}, {}, "__proto__")).to.throwError();
			expect(() => owe({}, undefined, undefined, "__proto__")).to.throwError();
			expect(() => owe({}, {}, {})).to.throwError();
			expect(() => owe({}, undefined, undefined, {})).to.throwError();
			expect(() => owe({}, {}, function() {})).to.throwError();
			expect(() => owe({}, undefined, undefined, function() {})).to.throwError();
			expect(() => owe({}, {}, Symbol("test"))).to.throwError();
			expect(() => owe({}, undefined, undefined, Symbol("test"))).to.throwError();
			expect(() => owe({}, {}, 1)).to.throwError();
			expect(() => owe({}, undefined, undefined, 1)).to.throwError();
		});

		it("should throw if type is given as a third param and there is a fourth one", function() {
			expect(() => owe({}, {}, true, true)).to.throwError();
		});
	});

	describe(".isApi()", function() {
		it("should return 'false' for everything that is not an instance of Api", function() {
			expect(owe.isApi()).to.be(false);
			expect(owe.isApi(undefined)).to.be(false);
			expect(owe.isApi(null)).to.be(false);
			expect(owe.isApi(123.456)).to.be(false);
			expect(owe.isApi("test")).to.be(false);
			expect(owe.isApi(NaN)).to.be(false);
			expect(owe.isApi(Infinity)).to.be(false);
			expect(owe.isApi({})).to.be(false);
			expect(owe.isApi(function() {})).to.be(false);
			expect(owe.isApi(owe({}))).to.be(false);
			expect(owe.isApi(Api)).to.be(false);
			expect(owe.isApi(Object.create(Api))).to.be(false);
			expect(owe.isApi(Symbol("test"))).to.be(false);
		});

		it("should return 'true' for everything that is an instance of Api", function() {
			expect(owe.isApi(new Api())).to.be(true);
			expect(owe.isApi(Object.create(new Api()))).to.be(true);
			expect(owe.isApi(Object.create(Api.prototype))).to.be(true);
		});
	});

	describe(".api()", function() {
		it("should return an Api instance for a given bound object", function() {
			const o = owe({});
			const api = owe.api(o);

			expect(api).to.be.an(Api);

			return api.object.then(object => expect(object).to.be(o));
		});

		it("should bind an unbound object and return an Api instance for it", function() {
			const o1 = {};
			const o2 = {};
			const f = function() {};
			const api1 = owe.api(o1);
			const api2 = owe.api(o2, f, f);

			expect(api1).to.be.an(Api);
			expect(api2).to.be.an(Api);
			expect(owe.isBound(o1)).to.be.ok();
			expect(owe.isBound(o2)).to.be.ok();

			expect(owe.Binding.getBinding(o2).router).to.be(f);
			expect(owe.Binding.getBinding(o2).closer).to.be(f);

			return Promise.all([
				api1.object.then(object => expect(object).to.be(o1)),
				api2.object.then(object => expect(object).to.be(o2))
			]);
		});
	});

	describe(".resource()", function() {
		it("should return an empty object for everything without a resource", function() {
			expect(owe.resource({})).to.eql({});
			expect(owe.resource(function() {})).to.eql({});
			expect(owe.resource(null)).to.eql({});
			expect(owe.resource(undefined)).to.eql({});
			expect(owe.resource(0)).to.eql({});
			expect(owe.resource(NaN)).to.eql({});
			expect(owe.resource(Infinity)).to.eql({});
			expect(owe.resource("test")).to.eql({});
			expect(owe.resource(1)).to.eql({});
			expect(owe.resource(true)).to.eql({});
			expect(owe.resource(Symbol("test"))).to.eql({});
		});

		it("should throw when assigning a resource to a basic type", function() {
			expect(() => owe.resource(null, {})).to.throwError();
			expect(() => owe.resource(0, {})).to.throwError();
			expect(() => owe.resource(undefined, {})).to.throwError();
			expect(() => owe.resource(55, {})).to.throwError();
			expect(() => owe.resource("test", {})).to.throwError();
			expect(() => owe.resource(true, {})).to.throwError();
			expect(() => owe.resource(Symbol("test"), {})).to.throwError();
		});

		it("should throw when assigning a basic type to an object", function() {
			expect(() => owe.resource({}, null)).to.throwError();
			expect(() => owe.resource({}, 0)).to.throwError();
			expect(() => owe.resource({}, 55)).to.throwError();
			expect(() => owe.resource({}, "test")).to.throwError();
			expect(() => owe.resource({}, true)).to.throwError();
			expect(() => owe.resource({}, Symbol("test"))).to.throwError();
		});

		it("should assign an object resource to an object that can then be read", function() {

			const a = {};
			const b = {};

			const test = owe.resource(a, b);

			expect(test).to.be(a);

			expect(owe.resource(a)).to.be(b);
		});
	});
});