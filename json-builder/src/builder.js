function Builder(form) {
	this.form = form;
	this.json = null;
}

Builder.prototype.init = function(json) {	
	this.json = json;
	this.html = this.buildForm(json);

	this.resetForm();
	
	var form = this.form;
	form.on("click", ".append", function(e) {
		e.preventDefault();
		var self = $(this);
		self.before(self.closest(".array").data("item"));
		/*
		var prev = $(this).prev(".item");
		if (prev) {
			prev.clone()
				.insertAfter(prev)
				.find("input")
				.val("")
				.end()
				.find(".item:gt(0)")
				.remove();
		}
		*/
		form.trigger("change");
	});

	form.on("click", ".remove", function(e) {
		e.preventDefault();
		var self = $(this);
		self.closest(".array").children(".item").last().remove();
		form.trigger("change");
	});

	form.on("input", "input, textarea", function() {
		form.trigger("change");
	});
};

Builder.prototype.resetForm = function() {
	this.form.html(this.html);
	var arrays = this.form.find(".array").get().reverse();
	$(arrays).each(function() {	
		var self = $(this);
		self.data("item", self.children(".item").clone());
	});
};

Builder.prototype.buildForm = function(json, name, html) {
	if (!json.type) {
		return;
	}

	name = name || "";
	html = html || "";

	var title = name.split(".").pop();

	switch (json.type) {
	case "array":
		var items = json.items;
		html = Handlebars.templates["array"]({
				name: name,
				title: title,
				html: this.buildForm(items, name)
		});
		break;
		
	case "object":
		if (name) {
			name += ".";
		}
		var props = json.properties;
		for (var i in props) {
			html += this.buildForm(props[i], name + i);
		}
		html = Handlebars.templates["object"]({
			name: name,
			title: title,
			html: html
		});
		break;
	
	case "string":
		html = Handlebars.templates["string"]({
			name: name,
			title: title
		});
		break;
	}
	
	return html;
};

Builder.prototype.setFormValues = function(json, scope, name) {
	scope = scope || this.form;
	name = name || "";
	if (name == "") {
		this.resetForm();
	}
	
	var type = $.type(json);
	switch (type) {
	case "array":
		var array = scope.find(".item[data-name='" + name + "']");
		for (var i in json) {
			if (i != 0) { 
				array = array
					.clone()
					.find("input")
					.val("")
					.end()
					.insertAfter(array)
					.find(".item:gt(0)")
					.remove()
					.end();
			}
			this.setFormValues(json[i], array, name);
		}
		break;
	
	case "object":
		if (name) {
			name += ".";
		}
		for (var i in json) {
			this.setFormValues(json[i], scope, name + i);
		}
		break;
	
	case "string":
		var input = scope.find("input[name='" + name + "']");
		input.val(json);
		break;
	}
	
	if (name == "") {
		this.form.trigger("change");
	}
};

Builder.prototype.getFormValuesAsJSON = function() {
	var values = this.getFormValues();
	var json = JSON.stringify(values, null, "  ");
	return json;
};

Builder.prototype.getFormValues = function() {
	var form = this.form;
	var values = {};

	(function iterate(obj, form, scope, name) {
		if (!obj.type) {
			return;
		}
		
		scope = scope || values;
		name = name || "";

		var key = name.split(".").pop();

		switch (obj.type) {
		case "array":
			scope[key] = [];
			var array = form.find(".item[data-name='" + name + "']");
			var i = 0;
			array.each(function() {
				iterate(
					obj.items,
					$(this),
					scope[key],
					name
				);
				i++;
			});
			break;
		
		case "object":
			var props = obj.properties;
			var type = $.type(scope);
			if (type == "array") {
				scope.push({});
			} else if (key !== "") {
				scope[key] = {};
			}
			if (name) {
				name += ".";
			}
			for (var i in props) {
				iterate(
					props[i],
					form,
					type == "array" ? scope[scope.length - 1] : scope[key],
					name + i
				);
			}
			break;
		
		case "string":
			var inputs = form.find("input[name='" + name + "']");
			if ($.type(scope) != "array") {
				scope[key] = inputs.eq(0).val();
			} else {
				inputs.each(function() {
					scope.push($(this).val());
				});
			}
			break;
		}
	})(this.json, form);
	
	return values;
};
