;(function (undefined) {

	var App = require('./app.js');

	function get_data () {
		return {
			"logs": [
				{
					"name": "MS1 logs",
					"file": "/home/ve/Env/5.3/www/ms1/wp-content/debug.log",
					"watching": true
				},
				{
					"name": "MS1 Cron",
					"file": "/home/ve/Env/5.3/www/ms1/wp-content/uploads/snapshots/_logs/15080716150e0912.log",
					"watching": true
				}
			]
		};
	}

	function run () {
		$.each(App.get_queue(), function (idx, watcher) {
			if (watcher.watching) watcher.tailer.watch();
		});
		App.run();
	}

	function init () {
		$.each(get_data().logs, function (idx, data) {
			App.add_watcher(data);
		});

		App.run();
	}

	init();

})();
