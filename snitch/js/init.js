;(function (undefined) {

	var Ipc = require('electron').ipcRenderer,
		Fs = require('fs'),
		Readline = require('readline')
	;

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

	function to_log_index (path) {
		return 'log-' + (path || '').replace(/[^-_A-Za-z0-9]/g, '-').replace(/-+/, '');
	}

	function add_watcher (data) {
		var index = to_log_index(data.file),
			tailer = new Tail(data.file),
			watcher = {
				name: data.name,
				file: data.file,
				watching: data.watching,
				tailer: tailer
			}
		;
		log_queue[index] = watcher;

		tailer.unwatch();

		$logs.append('<li data-id="' + index + '">' + data.name + '</li>');
		$out.append('<div data-id="' + index + '"></div>');

		initialize_log(index);
		bootstrap_item_events(index);
	}

	function initialize_log (index) {
		var watcher = log_queue[index],
			line_reader = Readline.createInterface({
				input: Fs.createReadStream(watcher.file)
			})
		;
		line_reader.on('line', function (txt) {
			if (!is_applicable(index, txt)) return false;
			txt = postprocess(index, txt);
			update(index, txt);
		});
	}

	function get_logs_item (index) {
		return $logs.find('[data-id="' + index + '"]');
	}

	function get_out_item (index) {
		return $out.find('[data-id="' + index + '"]');
	}

	/**
	 * Checks whether this line should be displayed at all
	 *
	 * @param {String} index Watcher index
	 * @param {String} txt Line to be checked
	 *
	 * @return {Boolean}
	 */
	function is_applicable (index, txt) { return true; }

	/**
	 * Performs any post-processing to the log line
	 *
	 * @param {String} index Watcher index
	 * @param {String} txt Line to be checked
	 *
	 * @return {String} Postprocessed line
	 */
	function postprocess (index, txt) { return txt; }

	function bootstrap_item_events (index) {
		var watcher = log_queue[index],
			$title = get_logs_item(index),
			$body = get_out_item(index),
			update_all = function (txt) {
				if (!is_applicable(index, txt)) return false;
				txt = postprocess(index, txt);
				notify(index, txt);
				update(index, txt);
				Ipc.send('new-line', txt);
			}
		;

		watcher.tailer.removeListener("line", update_all).on("line", update_all);

		$title.on("click", function () {
			/*
			watcher.watching = !watcher.watching;
			if (!watcher.watching) {
				$title.text(watcher.name + ' (paused)');
				watcher.tailer.unwatch();
			} else {
				$title.text(watcher.name + ' (run)');
				watcher.tailer.watch();
			}
			*/
			$('#out [data-id]').removeClass('active');
			$body.addClass('active');

			$("#logs [data-id]").removeClass('active');
			$title.addClass('active');
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
			Ipc.send('mark-read');
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
			if (watcher.watching) watcher.tailer.watch();
		});
		// Throw first click event to kick things up
		$("#logs [data-id]").first().click();
	}

	function init () {
		$.each(get_data().logs, function (idx, data) {
			add_watcher(data);
		});

		run();
	}

	init();

})();
