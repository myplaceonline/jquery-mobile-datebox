---
title: DurationFlipBox Options
layout: apicat
sect: mode
mode: durationflipbox
---

# Option List - DurationFlipBox mode


<div class="row">
	{% assign counter = 0 %}
	{% for docu in site.pages %}
	{% if docu.layout == "api" %}
	{% for mod in docu.modes %}
	{% if mod == page.mode %}

	{% capture counter %}{{ counter | plus : 1 }}{% endcapture %}
	{% capture style %}{% if docu.depre == "true" %} style="color:#ccc;text-decoration:line-through"{% endif %}{% endcapture %}
	{% capture classy %}{% if docu.relat == "i18n" %}primary{% elsif docu.relat == "limiting" %}warning{% elsif docu.relat == "control" %}success{% elsif docu.relat == "callback" %}danger{% elsif docu.relat == "display" %}info{% else %}default{% endif %}{% endcapture %}
	<div class="col-sm-4"><div class="panel panel-default">
		<div class="panel-heading">
			<a class="pull-right btn btn-xs btn-{{ classy }}" href="{{site.basesite}}api/cat-{{docu.relat}}">{{docu.relat}}</a>
			<h3 class="panel-title" {{style}}>
				<a href="{{site.basesite}}{{docu.url | remove_first: "/" }}">{{ docu.title }}</a>
			</h3>
		</div>
		<div class="panel-body">
			<p>{{docu.short}}</p>
		</div>
	</div></div>
	{% if counter == "3" %}
</div><div class="row">
	{% capture counter %}0{% endcapture %}
	{% endif %}

	{% endif %}
	{% endfor %}

	{% endif %}
	{% endfor %}
</div>

