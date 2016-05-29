;(function (undefined) {

	var template = require('lodash.template'); // https://www.npmjs.com/package/lodash.template

	function get_item_meta () {
		return [
			'<div class="name meta-item">',
				'<a href="#path">Name</a>',
				'<div class="meta-content">',
					'<input name="name" type="text" value="<%= data.name %>" />',
				'</div>',
			'</div>',

			'<div class="path meta-item">',
				'<a href="#path">Path</a>',
				'<div class="meta-content">',
					'<input name="file" type="text" value="<%= data.file %>" />',
				'</div>',
			'</div>',

			'<div class="only meta-item">',
				'<a href="#show-only">Show only</a>',
				'<div class="meta-content">',
					'<textarea name="only_condition"><%= data.only_condition %></textarea>',
				'</div>',
			'</div>',

			'<div class="except meta-item">',
				'<a href="#show-except">Show except</a>',
				'<div class="meta-content">',
					'<textarea name="except_condition"><%= data.except_condition %></textarea>',
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
						'<a href="#clear"><span>Clear</span></a>',
						' ',
						'<a href="#pause"><span>Pause</span></a>',
						' ',
						'<a href="#kill"><span>Kill</span></a>',
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
				'<div class="save"><button><span>Save</span></button></div>',
				'<div class="cancel"><button><span>Cancel</span></button></div>',
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
