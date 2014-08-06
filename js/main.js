// Global by intention.
// This variable will be accessed by sync.js
var builder;

jQuery(document).ready(function($) {
	var form = $("#form");
	builder = new Builder(form);

	$.getJSON("json/schema.json", function(data) {
		builder.init(data);
	});

	var preview = $("#preview");
	var iframe = $("#iframe");

	(function() {
		var timer = null;
		form.on("change", function() {
			clearTimeout(timer);
			preview.addClass("loading");
			timer = setTimeout(function() {
				var data = builder.getFormValues();
				var json = JSON.stringify({
					resume: data
				}, null, "  ");
				form.data("resume", data);
				form.data("resume.json", json);
				postResume(json);
			}, 200);
		});
	})();

	function postResume(data) {
		var theme = "flat";
		var hash = window.location.hash;
		if (hash != "") {
			theme = hash.replace("#", "");
		}
		$.ajax({
			type: "POST",
			contentType: "application/json",
			data: data,
			url: "http://themes.jsonresume.org/" + theme,
			success: function(html) {
				iframe.contents().find("body").html(html);
				preview.removeClass("loading");
			}
		});
		(function toggleActive() {
			$("#theme-current").html(theme);
			var active = $("#themes-list .item[href='#" + theme + "']").addClass("active");
			active.siblings().removeClass("active");
		})();
	}

	enableTSEplugin();
	enableCSStransitions();

	$("#export").on("click", function() {
		download(form.data("resume.json"), "resume.json", "text/plain");
	});
	$("#export, #save").tooltip({
		container: "body"
	});

	var tabs = $("#sidebar .tabs a");
	tabs.on("click", function() {
		var self = $(this);
		self.addClass("active").siblings().removeClass("active");
	});

	(function getThemes() {
		var list = $("#themes-list");
		var item = list.find(".item").remove();
		$.getJSON("http://themes.jsonresume.org/themes.json", function(json) {
			var themes = json.themes;
			if (!themes) {
				return;
			}
			for (var t in themes) {
				var theme = item
					.clone()
					.attr("href", "#" + t)
					.find(".name")
					.html(t)
					.end()
					.find(".version")
					.html(themes[t].versions.pop())
					.end()
					.appendTo(list);
			}
		});
		list.on("click", ".item", function() {
			form.trigger("change");
		});
	})();
	
	var jsonEditor = $("#json-editor");

	(function() {
		var timer = null;
		jsonEditor.on("keyup", function() {
			clearTimeout(timer);
			timer = setTimeout(function() {
				try {
					var text = jsonEditor.val();
					builder.setFormValues(JSON.parse(text))
				} catch(e) {
					// ..
				}
			}, 200);
		});
	})();

	form.on("change", function() {
		var json = builder.getFormValuesAsJSON();
		if (jsonEditor.val() !== json) {
			jsonEditor.val(json);
		}
	});
	
	$("#sidebar .view").on("click", "a", function(e) {
		e.preventDefault();
		var self = $(this);
		var type = self.data("type");
		self.addClass("active").siblings().removeClass("active");
		jsonEditor.toggleClass("show", type == "json");
	});
});

function reset() {
	$.getJSON("json/resume.json", function(data) {
		builder.setFormValues(data);
	});
}

function enableTSEplugin() {
	var preview = $("#preview");
	var scrollable = $(".tse-scrollable");
	scrollable.TrackpadScrollEmulator();
	scrollable.on("startDrag", function() {
		preview.addClass("scroll");
	});
	scrollable.on("endDrag", function() {
		preview.removeClass("scroll");
	});
}

function enableCSStransitions() {
	setTimeout(function() {
		$("body").removeClass("preload");
	}, 200);
}
