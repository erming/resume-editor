$(function() {
	var timer = null;
	var output = $("#output").on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			var post = true;
			try {
				JSON.parse(output.val());
			} catch(e) {
				post = false;
			}
			if (post) {
				form.trigger("submit");
			}
		}, 250);
	});

	var form = $("#form").on("submit", function(e) {
		e.preventDefault();
		var data = JSON.stringify({
			resume: JSON.parse(output.val())
		});
		$.ajax({
			contentType: "application/json",
			data: data,
			url: "http://themes.jsonresume.org/theme/flat",
			success: function(html) {
				$("#iframe").contents().find("body").html(html);
			},
			type: "POST"
		});
	});

	var resume = {
		bio: {
			firstName: "",
			lastName: "",
			location: {
				city : ""
			},
			summary: "",
			email: {
				work: "",
				personal: ""
			},
			phone: {
				work: "",
				personal: ""
			},
			profiles: {
				github: "",
				twitter: ""
			}
		}
	};

	var inputs = form
		.find("input")
		.on("input", update)
		.on("click", function() {
			$(this).select();
		});

	function update() {
		inputs.each(function() {
			var self = $(this);
			try {
				eval("resume." +  self.attr("name") + " = '" + self.val() + "'");
			} catch(e) {
				// ..
			}
		});
		output.html(
			JSON.stringify(resume, null, "  ")
		).trigger("input");
	}

	update();

	var sidebar = $("#sidebar");
	setTimeout(function() {
		sidebar.find(".header").eq(0).trigger("click");
	}, 320);
});
