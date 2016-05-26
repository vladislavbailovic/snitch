;(function (undefined) {

	var template = require('lodash.template'); // https://www.npmjs.com/package/lodash.template

	module.exports = {
		Logs: {
			Item: template([
				'<li data-id="<%= index %>">',
					'<%= data.name %>',
					'<div class="meta">',

						'<div class="clear meta-item">',
							'<a href="#clear">Clear</a>',
						'</div>',

						'<div class="path meta-item">',
							'<a href="#path">Path</a>',
							'<div class="meta-content">',
								'<input type="text" />',
							'</div>',
						'</div>',

						'<div class="only meta-item">',
							'<a href="#show-only">Show only</a>',
							'<div class="meta-content">',
								'<textarea></textarea>',
							'</div>',
						'</div>',

						'<div class="except meta-item">',
							'<a href="#show-except">Show except</a>',
							'<div class="meta-content">',
								'<textarea></textarea>',
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
