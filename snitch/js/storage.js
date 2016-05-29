;(function (undefined) {

	var assign = require('lodash.assign'),
		clone = require('lodash.clone')
	;

	var PFX = 'snitch-app';

	function get_valid_data (data) {
		return assign({}, {
			logs: []
		}, data);
	}

	function get_data () {
		return get_valid_data(clone(localStorage[PFX]));
	}

	function set_data (data) {
		return !!(localStorage[PFX] = data);
	}

	function get_valid_item (item) {
		return assign({}, {
			name: false,
			file: false,
			watching: false,
			only_condition: false,
			except_condition: false
		}, item);
	}

	function add_item (item) {
		get_valid_item({name: "source"});
	}

	module.exports = {
		get_data: get_data,
		add_item: add_item
	};
})();
