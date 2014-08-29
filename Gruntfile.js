module.exports = function(grunt) {
	var libs = "js/libs/**/*.js";
	grunt.initConfig({
		uglify: {
			options: {
				compress: false
			},
			js: {
				files: {
					"js/libs.min.js": libs
				}
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.registerTask(
		"default",
		["uglify"]
	);
};
