"use strict";

const gulp = require("gulp");
const istanbul = require("gulp-istanbul");
const mocha = require("gulp-mocha");
const eslint = require("gulp-eslint");
const runSequence = require("run-sequence");
const shell = require("gulp-shell");

require("chai").use(require("chai-as-promised"));

gulp.task("eslint", () => {
	return gulp.src(["src/*.js", "test/*.test.js"])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task("mocha", callback => {
	const coverageVariable = `c${Date.now()}`;

	gulp.src(["src/*.js"])
		.pipe(istanbul({ coverageVariable }))
		.on("error", callback)
		.pipe(istanbul.hookRequire())
		.on("finish", () => {
			gulp.src(["test/*.test.js"])
				.pipe(mocha())
				.on("error", callback)
				.pipe(istanbul.writeReports({ coverageVariable }))
				.pipe(istanbul.enforceThresholds({
					thresholds: {
						global: 90
					}
				}))
				.on("end", callback);
		});
});

gulp.task("test", callback => {
	runSequence("mocha", "eslint", callback);
});

gulp.task("docs", callback => {
	gulp.src("src/index.js")
		.pipe(shell("./node_modules/.bin/jsdoc --configure .jsdoc.json"))
		.on("error", callback)
		.on("end", callback);
});

gulp.task("docWatch", () => {
	gulp.start(["test", "docs"]);
	gulp.watch(["README.md", "src/**", "test/**"], ["test", "docs"]);
});

gulp.task("watch", () => {
	gulp.start(["test"]);
	gulp.watch(["src/**", "test/**"], ["test"]);
});

gulp.task("default", ["watch"]);

gulp.task("deploy", ["test", "docs"]);
