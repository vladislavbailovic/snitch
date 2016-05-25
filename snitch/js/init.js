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

		bootstrap_events(index);
	}

	function get_logs_item (index) {
		return $logs.find('[data-id="' + index + '"]');
	}

	function get_out_item (index) {
		return $out.find('[data-id="' + index + '"]');
	}

	function bootstrap_events (index) {
		var watcher = log_queue[index],
			$title = get_logs_item(index),
			$body = get_out_item(index),
			update_all = function (txt) {
				notify(index, txt);
				update(index, txt);
			}
		;

		watcher.tailer.removeListener("line", update_all).on("line", update_all);

		$title.on("click", function () {
			watcher.active = !watcher.active;
			if (!watcher.active) {
				$title.text(watcher.name + ' (paused)');
				watcher.tailer.unwatch();
			} else {
				$title.text(watcher.name + ' (run)');
				watcher.tailer.watch();
			}
		});
	}

	function notify (idx, txt) {
		var watcher = log_queue[idx],
			title = watcher.name,
			ntf = new Notification(title, {
		 		body: txt
			})
		;
		ntf.onclick = function () {
			var $item = get_logs_item(idx);
			console.log($item);
			ntf.cancel();
		};
	}

	function update (idx, txt) {
		var $body = get_out_item(idx);
		$body.html(
			$body.html() +
			'<pre>' + txt + '</pre>'
		);
	}

	function run () {
		$.each(log_queue, function (idx, watcher) {
			if (watcher.active) watcher.tailer.watch();
		});
	}

	function init () {
		$.each(get_data().logs, function (idx, data) {
			add_watcher(data);
		});

		run();
	}

	init();

})();
