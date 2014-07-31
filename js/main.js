jQuery(document).ready(function($) {
	var form = $("#form");
	var builder = new Builder(form);

	$.getJSON("schema.json", function(data) {
		builder.init(data);
		reset();
	});

	function reset() {
		$.getJSON("resume.json", function(data) {
			builder.setFormValues(data);
		});
	}

	var preview = $("#preview");
	var iframe = $("#iframe");

	var timer = null;
	form.on("change", function() {
		clearTimeout(timer);
		preview.addClass("loading");
		timer = setTimeout(function() {
			var data = JSON.stringify({
				resume: builder.getFormValues()
			}, null, "  ");
			postResume(data);
			form.data("resume", data);
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
        download(form.data("resume"), "resume.json", "text/plain");
    });
});
