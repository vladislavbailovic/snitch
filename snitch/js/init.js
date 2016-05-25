;(function (undefined) {

	var Tail = require('tail').Tail, // https://www.npmjs.com/package/tail
		$ = require('jquery') // https://www.npmjs.com/package/jquery
	;

	var $logs = $("#logs"),
		$out = $("#out")
	;

	var log_queue = {};

	function get_data () {
		return {
			"logs": [
				{
					"name": "MS1 logs",
					"file": "/home/ve/Env/5.3/www/ms1/wp-content/debug.log",
					"active": true
				},
				{
					"name": "MS1 Cron",
					"file": "/home/ve/Env/5.3/www/ms1/wp-content/uploads/snapshots/_logs/15080716150e0912.log",
					"active": true
				}
			]
		};
	}

	function to_log_index (path) {
		return 'log-' + (path || '').replace(/[^-_A-Za-z0-9]/g, '-').replace(/-+/, '');
	}

	function add_watcher (data) {
		var index = to_log_index(data.file),
			tailer = new Tail(data.file),
			watcher = {
				name: data.name,
				file: data.file,
				active: data.active,
				tailer: tailer
			}
		;
		log_queue[index] = watcher;

		tailer.unwatch();

		$logs.append('<li data-id="' + index + '">' + data.name + '</li>');
		$out.append('<div data-id="' + index + '"></div>');
	}

	function notify (idx, txt) {
		var watcher = log_queue[idx],
			title = watcher.name,
			ntf = new Notification(title, {
		 		body: txt
			})
		;
		ntf.onclick = function () {
			var $item = $logs.find('[data-id="' + idx + '"]');
			console.log($item);
			ntf.cancel();
		};
	}

	function update (idx, txt) {
		var $body = $out.find('[data-id="' + idx + '"]');
		$body.html(
			$body.html() +
			'<pre>' + txt + '</pre>'
		);
	}

	function init () {
		$.each(get_data().logs, function (idx, data) {
			add_watcher(data);
		});

		$.each(log_queue, function (idx, watcher) {
			watcher.tailer.on("line", function (txt) {
				notify(idx, txt);
				update(idx, txt);
			});
			if (watcher.active) watcher.tailer.watch();
		});
	}

	init();

})();
