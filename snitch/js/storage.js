;(function (undefined) {

	var assign = require('lodash.assign');

	var PFX = 'snitch-app';

	function get_valid_data (data) {
		return assign({}, {
			logs: []
		}, (data || {}));
	}

	function get_data () {
		return get_valid_data(JSON.parse(localStorage.getItem(PFX)));
	}

	function set_data (data) {
		return localStorage.setItem(PFX, JSON.stringify(data));
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
		item = get_valid_item(item);
		data = get_data();
		data.logs.push(item);
		set_data(data);
	}

	function update_item (idx, item) {
		item = get_valid_item(item);
		data = get_data();
		data.logs[idx] = item;
		set_data(data);
	}

	module.exports = {
		get_data: get_data,
		add_item: add_item,
		update_item: update_item
	};
})();
