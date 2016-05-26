;(function (undefined) {

	var template = require('lodash.template'); // https://www.npmjs.com/package/lodash.template

	module.exports = {
		Logs: {
			Item: template([
				'<li data-id="<%= index %>">',
					'<h4><%= data.name %></h4>',
					'<div class="meta">',

						'<div class="meta-actions">',
							'<a href="#clear">Clear</a>',
							' ',
							'<a href="#clear">Pause</a>',
							' ',
							'<a href="#kill">Kill</a>',
						'</div>',

						'<div class="path meta-item">',
							'<a href="#path">Path</a>',
							'<div class="meta-content">',
								'<input type="text" value="<%= data.file %>" />',
							'</div>',
						'</div>',

						'<div class="only meta-item">',
							'<a href="#show-only">Show only</a>',
							'<div class="meta-content">',
								'<textarea><%= data.only_condition %></textarea>',
							'</div>',
						'</div>',

						'<div class="except meta-item">',
							'<a href="#show-except">Show except</a>',
							'<div class="meta-content">',
								'<textarea><%= data.except_condition %></textarea>',
							'</div>',
						'</div>',

					'</div>',
				'</li>'
			].join('')),
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
})();
