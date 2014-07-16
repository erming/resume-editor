$(function() {
	var sidebar = $("#sidebar");
	var inputs = sidebar.find("input").val("");

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
			var self = sidebar.find("[data-name='" + key + "']");
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
			(function iterate(obj, key) {
				if ($.type(obj) == "object") {
					for (var i in obj) {
						var k = key ? [key, i].join(".") : i;
						iterate(obj[i],	k);
					}
					return;
				} else if ($.type(obj) == "array") {
					var item = sidebar.find("[data-name='" + key + "']").eq(0);
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
			
			var hash = window.location.hash;
			if (hash != "") {
				var theme = sidebar.find(".dropdown a[href='" + hash + "']");
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
			sidebar.trigger("output");
		}, 200);
	});
	
	$("#export, #save").tooltip({
		container: "body"
	});

	sidebar.on("input", "input", function() {
		update();
	});

	sidebar.on("output", function(e) {
		e.preventDefault();
		
		var json = "";
		try {
			var json = JSON.parse(output.val());
		} catch (e) {
			console.log(output.val());
			return;
		}
		
		var theme = sidebar.find(".dropdown").data("selected") || "flat";
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

	sidebar.on("click", "input", function() {
		$(this).select();
	});

	sidebar.on("click", ".dropdown a", function() {
		var theme = $(this).attr("href").substring(1);
		sidebar.find(".dropdown").data("selected", theme).find("button").html(theme);
		sidebar.trigger("output");
	});

	sidebar.on("click", ".add", function() {
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
	
	$("#export").on("click", function() {
		download(output.val(), "resume.json", "text/plain");
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
