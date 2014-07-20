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
	function resetBuilder (resumeObj) {
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
					var clone = item[0].outerHTML;
					item.next(".add").data("clone", clone);
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
			})(resumeObj);

			resume = resumeObj;

			var hash = window.location.hash;
			if (hash != "") {
				var theme = edit.find(".dropdown a[href='" + hash + "']");
				theme.trigger("click");
			}

			update();
	}
	function reset() {
		$.getJSON("resume.json", function (json) {
			resetBuilder(json);
		});
	}

	reset();

	var output = $("#output");
	var timer = null;

	output.on("input", function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			edit.trigger("output");
		}, 120);
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
		var clone = self.data("clone");
		if (clone) {
			self.before(clone);
		}
	});

	edit.on("click", ".delete", function() {
		var self = $(this);
		self.closest(".array").remove();
		update();
	});

	$("#reset").on("click", function() {
		if (confirm("Are you sure you want to start over? This action will clear the input fields and reload the theme.")) {
			reset();
		}
	});

	$("#export").on("click", function() {
		download(output.val(), "resume.json", "text/plain");
	});

	var rows = $(".row");

	rows.sortable({
		containment: "parent",
		items: ".array",
		handle: ".handle",
		placeholder: "placeholder",
		forcePlaceholderSize: true,
		scroll: false,
		update: function() {
			update();
		}
	});

	rows.on("click", ".handle", function() {
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



	/* Session */
	var SessionModel = Backbone.Model.extend({
      
        urlRoot: '/session',
        initialize: function () {
          var that = this;
          // Hook into jquery

          // Use withCredentials to send the server cookies
          // The server must allow this through response headers
          $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
          	if(options.url.indexOf('session') !== -1) {
          		options.url = 'http://registry.jsonresume.org/' + options.url;
          		//options.url = 'http://localhost:5000' + options.url;
	            options.xhrFields = {
	              withCredentials: true
	            };
	            // If we have a csrf token send it through with the next request
	            if(typeof that.get('_csrf') !== 'undefined') {
	              jqXHR.setRequestHeader('X-CSRF-Token', that.get('_csrf'));
	            }
	        }
          });
        },
        login: function(creds) {
          // Do a POST to /session and send the serialized form creds
          this.save(creds, {
             success: function () {}
          });
        },
        logout: function() {
          // Do a DELETE to /session and clear the clientside data
          var that = this;
          this.destroy({
            success: function (model, resp) {
              model.clear()
              model.id = null;
              // Set auth to false to trigger a change:auth event
              // The server also returns a new csrf token so that
              // the user can relogin without refreshing the page
              that.set({auth: false});//, _csrf: resp._csrf});
              
            }
          });      
        },
        getAuth: function(callback) {
          // getAuth is wrapped around our router
          // before we start any routers let us see if the user is valid
          this.fetch({
              success: callback
          });
        }
      }); 
      var Session = new SessionModel();
      Session.getAuth(function (session) {
      	//$.ajax('http://localhost:5000/thomasdavis.json', {
      	/*$.ajax('http://registry.jsonresume.org/'+session.get('username')+'.json', {
      		success: function (res) {
      			var resumeObj = res;
      			console.log(resumeObj);
				resetBuilder(resumeObj);
				update();
      		}
      	})*/
			//resetBuilder(json);

      });
      Session.on('change:auth', function (session) {
      	if(session.get('auth')) {
      		$.ajax('http://registry.jsonresume.org/'+session.get('username')+'.json', {
      		success: function (res) {
      			var resumeObj = res;
      			console.log(resumeObj);
				resetBuilder(resumeObj);
				update();
      		}
      	})
      	}
      })
      $('#login-button').on('click', function (ev) {
		$('#login-modal').modal('show');
      });
      $('.login-form').on('submit', function (ev) {
      	var form = $(ev.currentTarget);
      	var email = $('.login-email', form).val();
      	var password = $('.login-password', form).val();
      	console.log(email,password);
      	Session.login({
      		email: email,
      		password: password
      	});
      	return false;
      });
});
