$(function() {
	var timer = null;
	var resume = $("#resume").on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			var post = true;
			try {
				JSON.parse(resume.val());
			} catch(e) {
				post = false;
			}
			if (post) {
				form.trigger("submit");
			}
		}, 250);
	});
	
	$.ajax({
		dataType: "text",
		url: "resume.json",
		success: function(json) {
			resume.html(json);
			form.trigger("submit");
		}
	});
	
	var form = $("#form");
	form.on("submit", function(e) {
		e.preventDefault();
		var data = JSON.stringify({
			resume: JSON.parse(resume.val())
		});
		$.ajax({
			type: "POST",
			url: "http://themes.jsonresume.org/theme/flat",
			contentType: "application/json",
			data: data,
			success: function(html) {
				$("#iframe").contents().find("body").html(html);
			}
		});
	});
});
