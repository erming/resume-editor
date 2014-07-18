$(function() {
	var edit = $("#edit");
	var inputs = edit.find("input").val("");

	var resume = {};

	function update() {
		// Clone resume object.
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
				value = [];
				self.each(function() {
					var self = $(this);
					var hash = {};
					self.find("input").each(function() {
						var self = $(this);
						hash[self.attr("name")] = self.hasClass("list") ? self.val().split(",") : self.val();
					});
					value.push(hash);
				});
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
								$.type(value) == "array" ? value.join(", ") : value
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

			var hash = window.location.hash;
			if (hash != "") {
				var theme = edit.find(".dropdown a[href='" + hash + "']");
				theme.trigger("click");
			}

			update();
		});
	}

	reset();

	var output = $("#output");
	var timer = null;

	output.on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			edit.trigger("output");
		}, 200);
	});

	$("#export, #save").tooltip({
		container: "body"
	});

	edit.on("input", "input", function() {
		update();
	});

	edit.on("output", function(e) {
		e.preventDefault();

		var json = "";
		try {
			var json = JSON.parse(output.val());
		} catch (e) {
			console.log(output.val());
			return;
		}

		var theme = edit.find(".dropdown").data("selected") || "flat";
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

	edit.on("click", ".dropdown a", function() {
		var theme = $(this).attr("href").substring(1);
		edit.find(".dropdown").data("selected", theme).find("button").html(theme);
		edit.trigger("output");
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
		if (confirm("Are you sure you want to start over? This action clear the input fields and reload the theme.")) {
			reset();
		}
	});

	$("#export").on("click", function() {
		download(output.val(), "resume.json", "text/plain");
	});

	$(".row").sortable({
		containment: "parent",
		items: ".array",
		handle: ".handle",
		placeholder: "placeholder",
		forcePlaceholderSize: true,
		scroll: false
	});

	$(".handle").click(function() {
		var self = $(this);
		self.next(".collapse").toggle();
	});

	var preview = $("#preview");
	$("#sidebar").resizable({
		handles: "e",
		minWidth: 200,
		maxWidth: 800
	}).on("resize", function(e, ui) {
		preview.css({
			left: ui.size.width
		});
	});
});
