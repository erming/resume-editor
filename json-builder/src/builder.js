function Builder(form) {
	this.form = form.addClass("json-builder");
	this.json = null;
	this.items = [];
}

Builder.prototype.init = function(json, cb) {	
	this.json = json;
	this.html = this.buildForm(json);

	this.resetForm();
	
	var self = this;
	var form = this.form;

	form.on("click", ".add", function(e) {
		e.preventDefault();
		var add = $(this);
		var name = add.closest(".array").data("name");
		var item = self.items[name].clone();
		add.before(item);
		form.trigger("change");
	});

	form.on("click", ".remove", function(e) {
		e.preventDefault();
		var self = $(this);
		self.closest(".array").children(".item:last").remove();
		form.trigger("change");
	});

	form.on("input", "input, textarea", function() {
		form.trigger("change");
	});

	if (typeof cb === "function") {
		cb();
	}
};

Builder.prototype.resetForm = function() {
	this.form.html(this.html);
	var self = this;
	var arrays = this.form
		.find(".array")
		.get()
		.reverse();
	$(arrays).each(function() {	
		var array = $(this);
		var name = array.data("name");
		var item = array.children(".item");
		if (!self.items[name]) {
			self.items[name] = item.clone();
		}
		item.remove();
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
		var array = scope.find(".array[data-name='" + name + "']");
		var add = array.find(".add");
		for (var i in json) {
			var item = this.items[name].clone();
			this.setFormValues(json[i], item, name);
			add.before(item)
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
		var form = this.form;
		form.trigger("change");
		if ($.fn.sortable) {
			form.find(".array").sortable({
				containment: "parent",
				cursor: "row-resize",
				items: ".item",
				handle: ".handle",
				placeholder: "placeholder",
				forcePlaceholderSize: true,
				scroll: false,
				update: function() {
					form.trigger("change");
				}
			});
		}
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
