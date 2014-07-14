$(function() {
	var edit = $("#edit");
	var inputs = edit.find("input").val("");

	var resume = {};

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
			var self = edit.find("[data-name='" + key + "']");
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

	function reset() {
		$.getJSON("resume.json", function (json) {
			console.log("RESET");
			(function iterate(obj, key) {
				if ($.type(obj) == "object") {
					for (var i in obj) {
						var k = key ? [key, i].join(".") : i;
						iterate(obj[i],	k);
					}
					return;
				} else if ($.type(obj) == "array") {
					var item = edit.find("[data-name='" + key + "']").eq(0);
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

			resume = json;
			update();
		});
	}

	reset();

	var output = $("#output");
	var timer = null;

	output.on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			try {
				var json = JSON.parse(output.val());
				edit.trigger("submit", json);
			} catch (e) {
				// ..
			}
		}, 200);
	});

	edit.on("input", "input", function() {
		update();
	});

	edit.on("submit", function(e, json) {
		e.preventDefault();
		var theme = $("#select").val().toLowerCase();
		var data = JSON.stringify({
			resume: json
		});
		$.ajax({
			type: "POST",
			contentType: "application/json",
			data: data,
			url: "http://themes.jsonresume.org/theme/" + theme,
			success: function(html) {
				$("#iframe").contents().find("body").html(html);
			}
		});
	});

	edit.on("click", "input", function() {
		$(this).select();
	});

	edit.on("change", "select", function() {
		try {
			var json = JSON.parse(output.val());
			edit.trigger("submit", json);
		} catch (e) {
			// ..
		}
	});

	edit.on("click", ".add", function() {
		var self = $(this);
		var array = self.prev(".array");
		if (array.length) {
			var clone = array.clone().find("input").val("").end();
			array.after(clone);
		}
	});

	$("#reset").on("click", function() {
		reset();
	});
});
