;(function (undefined) {

	var Storage = require('./storage.js'),
		App = require('./app.js')
	;


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
			logs = Storage.get_data().logs
		;

		for (i in logs) {
			App.add_watcher(logs[i]);
		}

		run();
	}

	init();

})();
