module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			files: "templates/*",
			tasks: ["build"]
		}
	});
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.registerTask(
		"build",
		function() {
			grunt.util.spawn({
				cmd: "bash",
				args: ["build.sh"]
			}, function() {
				// ..
			});
		}
	);
	grunt.registerTask(
		"default",
		["build"]
	);
};
