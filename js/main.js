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
	},
	work: []
};

$(function() {
	var form = $("#form");
	var inputs = form
		.find("input")
		.val("")
		.on("click", function() {
			$(this).select();
		});

	function iterate(obj, name) {
		var type = $.type(obj);
		switch (type) {
		case "object":
			for (var i in obj) {
				iterate(obj[i], (name ? name + "." : "") + i);
			}
			break;

		case "array":
			// ..
			break;

		default:
			inputs.filter("[data-name='" + name + "']").val(obj);
			break;
		}
	}

	$.getJSON("resume.json", function(resume) {
		iterate(resume);
		inputs.on("input", update);
		update();
	});

	function update() {
		var json = $.extend({}, resume);
		var flat = flatten(json);

		for (var i in flat) {
			var value = form.find("[data-name='" + i + "']").val();
			set(json, i, value);
		}

		output.html(JSON.stringify(json, null, "  "));
		output.trigger("input");
	}

	var output = $("#output");
	var timer = null;

	output.on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			try {
				form.trigger("submit", JSON.parse(output.val()));
			} catch (e) {
				// ..
			}
		}, 200);
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

	setTimeout(function() {
		$("#sidebar .header:first").trigger("click");
	}, 320);
});

function flatten(obj, name, hash) {
	name = name || "";
	hash = hash || {};

	for (var i in obj) {
		var key = [name, i].filter(String).join(".");
		var value = obj[i];
		var type = $.type(value);
		switch (type) {
		case "object":
			flatten(obj[i], key, hash);
			break;

		default:
			hash[key] = value;
			break;
		}
	}

	return hash;
};

function set(obj, name, value) {
	var k = name.split(".");
	while (k.length > 1) {
		obj = obj[k.shift()];
	}
	obj[k[0]] = value;
}
