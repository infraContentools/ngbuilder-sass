'use strict';

/**
 * - read all SASS sources from /scss folder
 * - transform into a minified .css file
 * - write it to /module.css
 */

module.exports = (function() {
	var cssmin, gulp, sass, concat, multipipe, path, _initialized;

	function init() {
		if (_initialized) return;

		gulp = require('gulp');
		sass = require('gulp-sass');
		cssmin = require('gulp-cssmin');
		concat = require('gulp-concat');
		multipipe = require('multipipe');
		path = require('path');

		_initialized = true;
	}

	function run(context, options, next) {
		if (options === false) return next();

		if (!context) {
			return next(new Error('Missing context object'));
		}

		init();

		var modulePath = context.modulePath;

		var includePaths = context.sassPaths ? Array.prototype.slice.call(context.sassPaths) : [];

		if (typeof includePaths === 'string') {
			includePaths = [includePaths];
		}

		includePaths.push(path.join(modulePath, 'scss'));

		var sassOptions = {
			outputStyle: 'compressed',
			includePaths: includePaths
		};

		var pipe = multipipe(
			gulp.src(path.join(modulePath, 'scss/**/*.scss')),
			sass(sassOptions),
			concat(context.moduleName + '.css'),
			cssmin()
		);

		function detach(err) {
			pipe.removeAllListeners();
			next(err);
		}

		pipe.once('error', detach);
		pipe.once('end', detach);

		pipe.pipe(gulp.dest(context.public));
	}

	return {
		name: 'sass',
		watcher: 'scss/**/*.scss',
		run: run
	};
})();