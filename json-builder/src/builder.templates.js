(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['array'] = template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", escapeExpression=this.escapeExpression, buffer = "<div class=\"array\" data-name=\""
    + escapeExpression(((helper = helpers.name || (depth0 && depth0.name)),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n	<div class=\"title\">\n		"
    + escapeExpression(((helper = helpers.title || (depth0 && depth0.title)),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n	</div>\n	<div class=\"item\" data-name=\""
    + escapeExpression(((helper = helpers.name || (depth0 && depth0.name)),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n		<div class=\"handle\"></div>\n		";
  stack1 = ((helper = helpers.html || (depth0 && depth0.html)),(typeof helper === functionType ? helper.call(depth0, {"name":"html","hash":{},"data":data}) : helper));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n	</div>\n	<button class=\"add\">\n		Add\n	</button>\n	<button class=\"remove\">\n		Remove\n	</button>\n</div>\n";
},"useData":true});
templates['object'] = template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", buffer = "<div class=\"object\">\n	";
  stack1 = ((helper = helpers.html || (depth0 && depth0.html)),(typeof helper === functionType ? helper.call(depth0, {"name":"html","hash":{},"data":data}) : helper));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer + "\n</div>\n";
},"useData":true});
templates['string'] = template({"compiler":[5,">= 2.0.0"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", escapeExpression=this.escapeExpression;
  return "<div class=\"string\">\n	<label>\n		<div class=\"title\">"
    + escapeExpression(((helper = helpers.title || (depth0 && depth0.title)),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</div>\n		<input name=\""
    + escapeExpression(((helper = helpers.name || (depth0 && depth0.name)),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\" value=\"\">\n	</label>\n</div>\n";
},"useData":true});
})();