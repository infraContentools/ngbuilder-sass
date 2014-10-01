'use strict';

/**
 * - read all SASS sources from /scss folder
 * - transform into a minified .css file
 * - write it to /module.css
 */

module.exports = (function() {
	var _initialized, cssmin, vinyl, sass, concat, multipipe, nodePath = require('path');

	function init() {
		if (_initialized) return;

		vinyl = require('vinyl-fs');
		sass = require('gulp-sass');
		cssmin = require('gulp-cssmin');
		concat = require('gulp-concat');
		multipipe = require('multipipe');

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

		includePaths.push(nodePath.join(modulePath, 'scss'));

		var sassOptions = {
			outputStyle: 'compressed',
			includePaths: includePaths
		};

		var pipe = multipipe(
			vinyl.src(nodePath.join(modulePath, 'scss/**/*.scss')),
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

		pipe.pipe(vinyl.dest(context.public));
	}

	function watcher(context) {
		var base = [nodePath.join(context.modulePath, 'scss/**/*.scss')],
			includePaths = context.sassPaths;

		if (!includePaths) {
			return base;
		}

		if (typeof includePaths === 'string') {
			includePaths = [includePaths];
		}

		includePaths = includePaths.map(function(path) {
			return nodePath.join(path, '**/*.scss');
		});

		return base.concat(includePaths);
	}

	return {
		name: 'sass',
		watcher: watcher,
		run: run
	};
})();