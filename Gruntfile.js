module.exports = function ( grunt )
{
	'use strict';

	// Load all Grunt tasks
	require( 'load-grunt-tasks' )( grunt );

	var allJsFiles = ['Gruntfile.js', 'js/*.js', '!js/*.min.js'],
		allCssFiles = 'css/*.css',
		allPhpFiles = ['**/*.php', '!node_modules/**'];

	// Grunt configuration
	grunt.initConfig( {

		// Read config file
		pkg            : grunt.file.readJSON( 'package.json' ),

		// Autoprefix CSS
		autoprefixer   : {
			options: {
				browsers: [
					'last 2 versions',
					'ie >= 9'
				]
			},
			all    : {
				src: allCssFiles
			}
		},

		// Beautify CSS code
		csscomb        : {
			all: {
				expand: true,
				src   : allCssFiles
			}
		},

		// JSHint
		jshint         : {
			options: {
				reporter: require( 'jshint-stylish' ),
				jshintrc: true // Auto search for .jshintrc files relative to the files being linted
			},
			all    : allJsFiles // Lint all JS files, except *.min.js (libraries)
		},

		// Check PHP syntax error
		phplint        : {
			all: allPhpFiles
		},

		// Check PHP coding standards
		phpcs          : {
			all    : {
				dir: allPhpFiles
			},
			options: {
				bin           : '/Applications/MAMP/bin/php/php5.4.19/bin/phpcs',
				standard      : 'codesniffer.ruleset.xml',
				reportFile    : 'phpcs.txt',
				ignoreExitCode: true
			}
		},

		// Optimize images
		imagemin       : {
			all: {
				files: [{
					expand: true,
					cwd   : 'img/',
					src   : ['*.*'], // Only plugin files
					dest  : 'img'
				}]
			}
		},

		// Add text domain
		addtextdomain  : {
			options: {
				textdomain   : '',       // Project text domain.
				updateDomains: ['rwmb', 'textdomain']  // List of text domains to replace. Update old text domain to use plugin slug
			},
			release: {
				files: [{
					expand: true,
					src   : allPhpFiles
				}]
			}
		},

		// Check text domain
		checktextdomain: {
			release: {
				options: {
					text_domain: 'meta-box', // Specify allowed domain(s)
					keywords   : [           // List keyword specifications
						'__:1,2d',
						'_e:1,2d',
						'_x:1,2c,3d',
						'esc_html__:1,2d',
						'esc_html_e:1,2d',
						'esc_html_x:1,2c,3d',
						'esc_attr__:1,2d',
						'esc_attr_e:1,2d',
						'esc_attr_x:1,2c,3d',
						'_ex:1,2c,3d',
						'_n:1,2,4d',
						'_nx:1,2,4c,5d',
						'_n_noop:1,2,3d',
						'_nx_noop:1,2,3c,4d'
					]
				},
				files  : [{
					expand: true,
					src   : allPhpFiles
				}]
			}
		},

		// Update translation files
		makepot        : {
			release: {
				options: {
					domainPath : '/lang',       // Where to save the POT file.
					potFilename: 'default.pot', // Name of the POT file.
					type       : 'wp-plugin',   // Type of project (wp-plugin or wp-theme).
					exclude    : ['demo/.*'],   // Don't translate demos, this is part of regex '|^' . $pattern . '$|',

					processPot: function ( pot )
					{
						pot.headers['report-msgid-bugs-to'] = 'https://github.com/rilwis/meta-box\n';
						pot.headers['plural-forms'] = 'nplurals=2; plural=n != 1;';
						pot.headers['x-poedit-basepath'] = '.';
						pot.headers['x-poedit-language'] = 'English';
						pot.headers['x-poedit-country'] = 'UNITED STATES';
						pot.headers['x-poedit-sourcecharset'] = 'utf-8';
						pot.headers['x-poedit-keywordslist'] = '__;_e;_x:1,2c;_ex:1,2c;_n:1,2; _nx:1,2,4c;_n_noop:1,2;_nx_noop:1,2,3c;esc_attr__; esc_html__;esc_attr_e; esc_html_e;esc_attr_x:1,2c; esc_html_x:1,2c;';
						pot.headers['x-poedit-bookmarks'] = '';
						pot.headers['x-poedit-searchpath-0'] = '.';
						pot.headers['x-textdomain-support'] = 'yes';
						return pot;
					}
				}
			}
		},

		// Watch source files
		watch          : {
			css: {
				files: allCssFiles,
				tasks: ['autoprefixer', 'csscomb']
			},
			js : {
				files: allJsFiles,
				tasks: ['jshint']
			},
			php: {
				files: allPhpFiles,
				tasks: ['phplint', 'phpcs']
			}
		},

		// Delete 'release' folder
		clean: {
			release: ['../../release/<%= pkg.name %>'],
			options: {
				force: true
			}
		},

		// Copy files to prepare to deploy to wordpress.org
		copy: {
			release: {
				files: [{
					expand: true,
					filter: 'isFile',
					dot: true,
					src: [
						'**/*',                 // All files, except below
						'!demo/*',              // No demo
						'!node_modules/**',     // Node modules
						'!**/.**',              // No dot files & folders
						'!**/.{svn,git}/**',
						'!*.{xml,json}',        // No config files
						'!Gruntfile.js',
						'!meta-box-loader.php', // No composer file
						'!readme.md',           // No readme for Github
						'!**/Thumbs.db',        // No special files generated by OSes
						'!**/.DS_Store/**'
					],
					dest  : '../../release/<%= pkg.name %>'
				}]
			}
		},

		// Deploy to wordpress.org
		wp_deploy      : {
			release: {
				options: {
					plugin_slug: 'meta-box',
					svn_user   : 'rilwis',
					build_dir  : 'release', // Relative path to your build directory
					max_buffer : 1024 * 1024
				}
			}
		}
	} );


	// Register tasks

	// CSS tasks
	grunt.registerTask( 'css', [
		'autoprefixer',
		'csscomb'
	] );

	// JS tasks
	grunt.registerTask( 'js', [
		'jshint'
	] );

	// PHP tasks
	grunt.registerTask( 'php', [
		'phplint',
		'phpcs'
	] );

	// Image tasks
	grunt.registerTask( 'image', [
		'imagemin'
	] );

	// Translation tasks
	grunt.registerTask( 'translation', [
		'addtextdomain',
		'checktextdomain',
		'makepot'
	] );

	// Default
	grunt.registerTask( 'default', [
		'css',
		'js',
		'php',
		'image',
		'translation'
	] );

	// Deploy to wordpress.org, steps:
	// - Remove 'old release' folder if exists
	// - Copy new files to that folder
	// - Deploy to wordpress.org
	grunt.registerTask( 'release', [
		'clean',
		'copy'
		//'wp_deploy'
	] );
};
