;(function (undefined) {

	var App = require('./app.js');

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

	function run () {
		var i,
			queue = App.get_queue()
		;
		for (i in queue) {
			if ((queue[i] || {}).watching) {
				((queue[i] || {}).tailer || {watch: function () {}}).watch();
			}
		}
		App.run();
	}

	function init () {
		var i,
			logs = get_data().logs
		;

		for (i in logs) {
			App.add_watcher(logs[i]);
		}

		run();
	}

	init();

})();
