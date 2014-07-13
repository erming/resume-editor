var resume = {
	bio: {
		firstName: "",
		lastName: "",
		email: {
			work: "",
			personal: ""
		},
		phone: {
			work: "",
			personal: ""
		},
		summary: "",
		location: {
			city: "",
			countryCode: "",
			state: ""
		},
		websites: {},
		profiles: {}
	},
	work: [],
	education: [],
	awards: [],
	publications: [],
	skills: [],
	references: []
};

$(function() {
	var form = $("#form");
	var inputs = form.find("input").val("");

	function update() {
		// Create a cloned object.
		var json = $.extend(
			{},
			resume
		);

		(function iterate(obj, key) {
			if ($.type(obj) == "object") {
				for (var i in obj) {
					var k = key ? [key, i].join(".") : i;
					iterate(obj[i],	k);
				}
				return;
			}

			var value = "";
			var self = form.find("[data-name='" + key + "']");
			if (!self.length) {
				return;
			}

			if (self.prop("tagName") == "INPUT") {
				value = self.val();
			} else {
				var hash = {};
				self.find("input").each(function() {
					var self = $(this);
					hash[self.attr("name")] = self.hasClass("array") ? self.val().split(",")
						: self.val();
				});
				value = [];
				value.push(hash);
			}

			var keys = key.split(".");
			(function(obj) {
				while (keys.length > 1) {
					obj = obj[keys.shift()];
				}
				obj[keys[0]] = value;
			})(json);
		})(json);

		output.html(JSON.stringify(json, null, "  "));
		output.trigger("input");
	}

	$.getJSON("resume.json", function (json) {
		(function iterate(obj, key) {
			if ($.type(obj) == "object") {
				for (var i in obj) {
					var k = key ? [key, i].join(".") : i;
					iterate(obj[i],	k);
				}
				return;
			} else if ($.type(obj) == "array") {
				var item = form.find("[data-name='" + key + "']").eq(0);
				if (!item.length) {
					return;
				}
				for (var i in obj) {
					for (var ii in obj[i]) {
						var value = obj[i][ii];
						item.find("input[name='" + ii + "']").val(
							$.type(value) == "array" ? value.join(", ")
								: value
						);
					}
				}
				return;
			}
			inputs.each(function() {
				var self = $(this);
				if (self.data("name") == key) {
					self.val(obj);
				}
			});
		})(json);
		update();
	});

	var output = $("#output");
	var timer = null;

	output.on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			try {
				var json = JSON.parse(output.val());
				form.trigger("submit", json);
			} catch (e) {
				// ..
			}
		}, 200);
	});

	form.on("input", "input", function() {
		update();
	});

	form.on("submit", function(e, json) {
		e.preventDefault();
		var data = JSON.stringify({
			resume: json
		});
		$.ajax({
			type: "POST",
			contentType: "application/json",
			data: data,
			url: "http://themes.jsonresume.org/theme/flat",
			success: function(html) {
				$("#iframe").contents().find("body").html(html);
			}
		});
	});

	form.on("click", "input", function() {
		$(this).select();
	});

	form.on("click", ".add", function() {
		var self = $(this);
		var array = self.prev(".array");
		if (array.length) {
			var clone = array.clone().find("input").val("").end();
			array.after(clone);
		}
	});
});
