;(function (undefined) {

	var Ipc = require('electron').ipcRenderer,
		Fs = require('fs'),
		Readline = require('readline')
	;

	var Tail = require('tail').Tail, // https://www.npmjs.com/package/tail
		$ = require('jquery'), // https://www.npmjs.com/package/jquery
		Template = require('./template'),
		Storage = require('./storage')
	;

	var $logs = $("#logs"),
		$out = $("#out")
	;

	var log_queue = {};

	function to_log_index (path) {
		return 'log-' + (path || '').replace(/[^-_A-Za-z0-9]/g, '-').replace(/-+/, '');
	}

	function add_watcher (data) {
		var index = to_log_index(data.file),
			tailer = new Tail(data.file),
			watcher = $.extend({}, data, {
				tailer: tailer
			})
		;
		log_queue[index] = watcher;

		tailer.unwatch();

		$logs.append(
			Template.Logs.Item({index: index, data: data})
		);
		$out.append(
			Template.Out.Item({index: index, data: data})
		);

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
	function is_applicable (index, txt) {
		var watcher = log_queue[index] || {},
			only = !!watcher.only_condition ? new RegExp(watcher.only_condition) : false,
			except = !!watcher.except_condition ? new RegExp(watcher.except_condition) : false
		;

		if (txt.match(/^\s*$/)) return false; // Skip empty lines

		if (only && !txt.match(only)) return false;
		if (except && txt.match(except)) return false;

		return true;
	}

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
			$('#out [data-id]').removeClass('active');
			$body.addClass('active');

			$("#logs [data-id]").removeClass('active');
			$title.addClass('active');
		});

		$title
			// Actions handling
			.find('a[href="#pause"]').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				var $me = $(this);

				watcher.watching = !watcher.watching;
				if (!watcher.watching) {
					$me.text('Start').addClass("paused");
					watcher.tailer.unwatch();
				} else {
					$me.text('Pause').removeClass("paused");
					watcher.tailer.watch();
				}

				return false;
			}).end()
			// Meta fields handling
			.find(':text[name="path"]').on('change', function (e) {
				log_queue[index].file = $(e.target).val();
				initialize_log(index);
			}).end()
			.find('textarea[name="only"]').on('change', function (e) {
				log_queue[index].only_condition = $(e.target).val();
				initialize_log(index);
			}).end()
			.find('textarea[name="except"]').on('change', function (e) {
				log_queue[index].except_condition = $(e.target).val();
				initialize_log(index);
			}).end()
		;
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
			Template.Out.ContentItem({txt: txt})
		);
	}

	function initialize_ui_events () {
		var $target = $("#addnew #target"),
			$add = $('#addnew a[href="#additem"]')
		;

		$add.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();

			$add.hide();

			$target
				.empty()
				.html(Template.Logs.AddNew({index: '', data: {}}))
			;

			$target
				.find('.save button').on('click', function (e) {
					e.preventDefault();
					e.stopPropagation();

					var item = {};
					$target.find('input,textarea').each(function () {
						var $me = $(this);
						item[$me.attr("name")] = $me.val();
					});
					Storage.add_item(item);
					//window.location.reload();

					$add.show();

					return false;
				}).end()
				.find('.cancel button').on('click', function (e) {
					e.preventDefault();
					e.stopPropagation();

					$target.empty();
					$add.show();

					return false;
				}).end()
			;

			return false;
		});
	}

	module.exports = {
		add_watcher: add_watcher,
		get_queue: function () {
			return log_queue;
		},
		run: function () {
			initialize_ui_events();
			// Throw first click event to kick things up
			$("#logs [data-id]").first().click();
		}
	};

})();
