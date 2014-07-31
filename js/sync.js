jQuery(document).ready(function($) {
	var proxiedSync = Backbone.sync;

	Backbone.sync = function(method, model, options) {
		options || (options = {});
		if (!options.crossDomain) {
		  options.crossDomain = true;
		}
		if (!options.xhrFields) {
		  options.xhrFields = {withCredentials:true};
		}
        options.url = 'http://registry.jsonresume.org' + model.url();
		return proxiedSync(method, model, options);
	};

    var SessionModel = Backbone.Model.extend({
        urlRoot: '/session',
        initialize: function() {
            var that = this;
        },
        login: function(creds, callback) {
            // Do a POST to /session and send the serialized form creds
            this.save(creds, {
                success: callback
            });
        },
        logout: function() {
            // Do a DELETE to /session and clear the clientside data
            var that = this;
            this.destroy({
                success: function(model, resp) {
                    model.clear()
                    model.id = null;
                    // Set auth to false to trigger a change:auth event
                    // The server also returns a new csrf token so that
                    // the user can relogin without refreshing the page
                    that.set({
                        auth: false
                    }); //, _csrf: resp._csrf});

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
    Session.getAuth(function(session) {
        if (session.get('auth')) {
            $('#logout').fadeIn(200);
            $.ajax('http://registry.jsonresume.org/' + session.get('username') + '.json', {
                xhrFields: {
                   withCredentials: true
                },
                success: function(res) {
                    var resumeObj = res;
                    builder.setFormValues(resumeObj);
                    //var theme = $(".dropdown a[href='#" + resumeObj.jsonresume.theme + "']");
                    //theme.trigger("click");
                }
            });
        } else {
            $('#register').fadeIn(200);
            $('#login').fadeIn(200);
            reset();
        }
    });

    Session.on('change:auth', function(session) {})

    $('#login').on('click', function(ev) {
        $('#login-modal').modal('show');
    });

    $('#register').on('click', function(ev) {
        $('#register-modal').modal('show');
    });

    $('#save').on('click', function(ev) {
    	if(Session.get('auth')) {
    		var resume = $("#form").data("resume");
			$('#publish-modal .modal-body').html('<p>Publishing...</p>');
        	$('#publish-modal').modal('show');
    		var resumeM = new ResumeModel();
    		resumeM.save({resume:resume, theme: $(".dropdown").data("selected")}, {
    			success: function () {
					$('#publish-modal .modal-body').html('<p>Beautiful! Access your published resume at<br /><a style="color: #007eff" href="http://registry.jsonresume.org/'+Session.get('username')+'" target="_blank">http://registry.jsonresume.org/'+Session.get('username')+'</a></p>');
    			}
    		})
    	} else {
        	$('#register-modal').modal('show');
        }
    });

    $('#logout').on('click', function(ev) {
        Session.logout();
        $('#logout').toggle();
        $('#register').toggle();
        $('#login').toggle();
        reset();
    });

    $('.login-form').on('submit', function(ev) {
        var form = $(ev.currentTarget);
        var email = $('.login-email', form).val();
        var password = $('.login-password', form).val();
        Session.login({
            email: email,
            password: password
        }, function() {
            $('#login-modal').modal('hide');
            $.ajax('http://registry.jsonresume.org/' + Session.get('username') + '.json', {
                success: function(res) {
                    var resumeObj = res;
                    resetBuilder(resumeObj);
                }
            });
            $('#logout').toggle();
            $('#register').toggle();
            $('#login').toggle();
        });
    });

    var UserModel = Backbone.Model.extend({
        urlRoot: '/user'
    });

    var ResumeModel = Backbone.Model.extend({
        urlRoot: '/resume'
    });

    $('.register-form').on('submit', function(ev) {
        var form = $(ev.currentTarget);
        var email = $('.register-email', form).val();
        var username = $('.register-username', form).val();
        var password = $('.register-password', form).val();
        var user = new UserModel();
        user.save({email: email, username:username, password:password},  {
        	success: function () {
        		$('.register-form .modal-body').html('<p>Excellent! We are now saving your first resume....</p>');
        		$('.register-form .modal-footer').remove();
	    		var resume = $("#form").data("resume");
	    		Session.getAuth(function() {
			        $('#logout').toggle();
			        $('#register').toggle();
			        $('#login').toggle();
		    		var resumeM = new ResumeModel();
		    		resumeM.save({resume:resume, theme: $(".dropdown").data("selected")}, {
		    			success: function () {
        					$('.register-form .modal-body').html('<p>Beautiful! Access your published resume at<br /><a style="color: #007eff" href="http://registry.jsonresume.org/'+Session.get('username')+'" target="_blank">http://registry.jsonresume.org/'+Session.get('username')+'</a></p>');
		    			}
		    		})
	    		})
        	}
        })
        return false;
    });
});
