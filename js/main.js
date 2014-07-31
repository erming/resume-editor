var builder;

jQuery(document).ready(function($) {
	var form = $("#form");
	builder = new Builder(form);

	$.getJSON("schema.json", function(data) {
		builder.init(data);
	});

	var preview = $("#preview");
	var iframe = $("#iframe");

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

	function postResume(data) {
		$.ajax({
			type: "POST",
			contentType: "application/json",
			data: data,
			url: "http://themes.jsonresume.org/boilerplate",
			success: function(html) {
				iframe.contents().find("body").html(html);
				preview.removeClass("loading");
			}
		});
	}

	$("#export, #save").tooltip({
        container: "body"
    });

	$("#export").on("click", function() {
        download(form.data("resume.json"), "resume.json", "text/plain");
    });
});

function reset() {
	$.getJSON("resume.json", function(data) {
		builder.setFormValues(data);
	});
}
