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

		$logs.append(
			'<li data-id="' + index + '">' +
				data.name +
				'<div class="meta">' +
					'<div><a href="#clear">Clear</a></div>' +
					'<div><a href="#path">Path</a></div>' +
					'<div><a href="#show-only">Show only</a></div>' +
					'<div><a href="#show-except">Show except</a></div>' +
				'</div>' +
			'</li>'
		);
		$out.append('<div data-id="' + index + '"></div>');

		initialize_log(index);
		bootstrap_item_events(index);
	}

	function initialize_log (index) {
		var watcher = log_queue[index],
			$body = get_out_item(index),
			line_reader = Readline.createInterface({
				input: Fs.createReadStream(watcher.file)
			}),
			lines = []
		;
		line_reader
			.on('line', function (txt) {
				if (!is_applicable(index, txt)) return false;
				txt = postprocess(index, txt);
				lines.push(txt);
				//update(index, txt);
			})
			.on('close', function () {
				$body.empty();
				if (!lines.length) return false;

				lines.reverse();
				$.each(lines, function (idx, line) {
					console.log(line);
					update(index, line);
				});
			})
		;
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
	function is_applicable (index, txt) { return !txt.match(/^\s*$/); }

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
				//update(index, txt);
				initialize_log(index);
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

		// Also expire the notice after a while
		setTimeout(function () {
			ntf.cancel();
		}, 5000);
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
