;(function (undefined) {

	var template = require('lodash.template'); // https://www.npmjs.com/package/lodash.template

	module.exports = {
		Logs: {
			Item: template([
				'<li data-id="<%= index %>">',
					'<%= data.name %>',
					'<div class="meta">',
						'<div><a href="#clear">Clear</a></div>',
						'<div><a href="#path">Path</a></div>',
						'<div><a href="#show-only">Show only</a></div>',
						'<div><a href="#show-except">Show except</a></div>',
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
