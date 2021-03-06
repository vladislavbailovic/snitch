;(function (undefined) {
	"use strict";

	var template = require('lodash.template'); // https://www.npmjs.com/package/lodash.template

	function get_item_meta () {
		return [
			'<div class="name meta-item">',
				'<label>Name</label>',
				'<div class="meta-content">',
					'<input name="name" type="text" value="<%= data.name %>" />',
				'</div>',
			'</div>',

			'<div class="path meta-item">',
				'<label>Path</label>',
				'<div class="meta-content">',
					'<input name="file" type="text" value="<%= data.file %>" />',
					'<a href="#choose"><span>...</span></a>',
					'<input name="filesel" type="file" value="" />',
				'</div>',
			'</div>',

			'<div class="only meta-item">',
				'<label>Show only (regex)</label>',
				'<div class="meta-content">',
					'<textarea name="only_condition"><%= data.only_condition %></textarea>',
				'</div>',
			'</div>',

			'<div class="except meta-item">',
				'<label>Show except (regex)</label>',
				'<div class="meta-content">',
					'<textarea name="except_condition"><%= data.except_condition %></textarea>',
				'</div>',
			'</div>',

			'<div class="postprocess meta-item">',
				'<label>Postprocess</label>',
				'<div class="meta-content">',
					'<select name="postprocess">',
						'<option></option>',
						'<option <%= ("json_decode" === data.postprocess ? "selected" : "") %> value="json_decode">Attempt JSON parse</option>',
					'</select>',
				'</div>',
			'</div>',
		].join('');
	}

	function get_item () {
		return [
			'<li data-id="<%= index %>">',
				'<h4><%= data.name %></h4>',
				'<div class="meta">',

					'<div class="meta-actions">',
						'<a tabindex="-1" title="Clear log" href="#clear"><span>Clear</span></a>',
						' ',
						'<a tabindex="-1" href="#pause" class="<%= (data.watching ? "paused" : "started") %>"><span><%= (data.watching ? "Start" : "Pause") %></span></a>',
						' ',
						'<a tabindex="-1" title="Remove from list" href="#kill"><span>Kill</span></a>',
					'</div>',

					get_item_meta(),

				'</div>',
			'</li>'
		].join('');
	}

	var Tpl = {
		Logs: {
			Item: template(get_item()),
			AddNew: template([
				get_item_meta(),
				'<div class="action save"><button><span>Save</span></button></div>',
				'<div class="action cancel"><button><span>Cancel</span></button></div>',
			].join(''))
		},
		Out: {
			Item: template([
				'<div data-id="<%= index %>"></div>',
			].join('')),
			ContentItem: template([
				'<pre><%= txt %></pre>'
			].join(''))
		}
	};

	module.exports = Tpl;

})();
