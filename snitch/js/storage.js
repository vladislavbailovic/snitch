;(function (undefined) {

	function get_data () {
		return {
			logs: [
				{
					name: "MS1 logs",
					file: "/home/ve/Env/5.3/www/ms1/wp-content/debug.log",
					watching: true,
					only_condition: '[Ff]atal [Ee]rror',
					except_condition: '[Ss]napshot_[Mm]odel_[Ff]ull_[Bb]ackup',
				},
				{
					name: "MS1 Cron",
					file: "/home/ve/Env/5.3/www/ms1/wp-content/uploads/snapshots/_logs/15080716150e0912.log",
					watching: true
				}
			]
		};
	}

	function set_data () {

	}

	function add_item () {

	}

	module.exports = {
		get_data: get_data,
		set_data: set_data,
		add_item: add_item
	};
})();
