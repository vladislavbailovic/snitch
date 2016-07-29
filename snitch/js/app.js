;(function (undefined) {
	"use strict";

	var Ipc = require('electron').ipcRenderer,
		Fs = require('fs'),
		Readline = require('readline')
	;

	var Tail = require('tail').Tail, // https://www.npmjs.com/package/tail
		$ = require('jquery'), // https://www.npmjs.com/package/jquery
		Template = require('./template'),
		Storage = require('./storage'),
		Postprocess = require('./postprocess'),
		SnitchNotifications = require('./notifications')
	;

	var $logs = $("#logs"),
		$out = $("#out")
	;

	var log_queue = {};

	/**
	 * Created provisional item ID based on its path and log position index
	 *
	 * @param {String} path Log path
	 * @param {Int} idx Log position index
	 *
	 * @return {String} A valid DOM ID
	 */
	function to_log_index (path, idx) {
		var str = path + '-' + (idx || 0);

		return 'log-' + (str || '').replace(/[^-_A-Za-z0-9]/g, '-').replace(/-+/, '');
	}

	/**
	 * Prepares a watcher item, its object, UI and events
	 *
	 * @param {Int} idx Queue index
	 * @param {Object} data Queue data
	 */
	function add_watcher (idx, data) {
		data = data || {};
		var index = to_log_index(data.file, idx),
			file = data.file || ''
		;
		Fs.exists(file, function (exists) {
			if (!exists) {
				Storage.remove_item(idx);
				return false;
			}
			var tailer = new Tail(data.file),
				watcher = $.extend({}, data, {
					_idx: idx,
					tailer: tailer
				})
			;
			log_queue[index] = watcher;

			update_watcher_ui(index);
			if (!watcher.watching) tailer.unwatch();
		});
	}

	/**
	 * Updates the watcher UI and bootstraps events
	 *
	 * @param {String} index Item index
	 *
	 * @return {Boolean}
	 */
	function update_watcher_ui (index) {
		var watcher = log_queue[index],
			$logs_item = get_logs_item(index),
			$out_item = get_out_item(index)
		;

		if ($logs_item.length) {
			$logs_item.replaceWith(Template.Logs.Item({index: index, data: watcher}));
			make_active(index);
		} else {
			$logs.append(Template.Logs.Item({index: index, data: watcher}));
		}

		if ($out_item.length) {
			$out_item.replaceWith(Template.Logs.Item({index: index, data: watcher}));
			make_active(index);
		} else {
			$out.append(Template.Out.Item({index: index, data: watcher}));
		}

		initialize_log(index);
		return bootstrap_item_events(index);
	}

	/**
	 * Reads the file to the output area for an item
	 *
	 * @param {String} index Item index
	 *
	 * @return {Boolean}
	 */
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

		return true;
	}

	/**
	 * Clears a log file
	 *
	 * @param {String} index Item index
	 *
	 * @return {Boolean}
	 */
	function clear_log (index) {
		var watcher = log_queue[index];
		return !!Fs.truncate(watcher.file, 0, function () {
			initialize_log(index);
		});
	}

	/**
	 * Gets appropriate item in logs area
	 *
	 * @param {String} index Item index
	 *
	 * @return {jQuery} jQuery DOM node
	 */
	function get_logs_item (index) {
		return $logs.find('[data-id="' + index + '"]');
	}

	/**
	 * Gets appropriate item in output area
	 *
	 * @param {String} index Item index
	 *
	 * @return {jQuery} jQuery DOM node
	 */
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
	function postprocess (index, txt) {
		var watcher = log_queue[index],
			callback = watcher.postprocess
		;
		if (!callback || !Postprocess[callback]) return txt;

		return Postprocess[callback](txt) || txt;
	}

	/**
	 * Makes an appropriate item currently active one
	 *
	 * @param {String} index Item index
	 *
	 * @return {Boolean}
	 */
	function make_active (index) {
		var $title = get_logs_item(index),
			$body = get_out_item(index)
		;
		$('#out [data-id]').removeClass('active');
		$body.addClass('active');

		$("#logs [data-id]").removeClass('active');
		$title.addClass('active');

		return $title.length && $body.length;
	}

	/**
	 * Initializes event handling on an instance
	 *
	 * Horrible, needs better implementation
	 *
	 * @param {String} index Item index
	 *
	 * @return {Boolean}
	 */
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
			make_active(index);
		});

		$title
		// Actions handling

			// Pause
			.find('a[href="#pause"]').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				var $me = $(this);

				watcher.watching = !watcher.watching;

				if (!watcher.watching) {
					watcher.tailer.unwatch();
				} else {
					watcher.tailer.watch();
				}
				Storage.update_item(watcher._idx, watcher);
				add_watcher(watcher._idx, watcher);

				return false;
			}).end()

			// Clear
			.find('a[href="#clear"]').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				clear_log(index);

				return false;
			}).end()

			// Kill
			.find('a[href="#kill"]').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				Storage.remove_item(watcher._idx);
				window.location.reload();

				return false;
			}).end()

		// Meta fields handling
			.find(':text,textarea,select').on('change', function (e) {
				var $me = $(e.target),
					name = $me.attr("name"),
					value = $me.val()
				;
				log_queue[index][name] = value;
				Storage.update_item(watcher._idx, log_queue[index]);
				add_watcher(watcher._idx, watcher);
			}).end()

			.find('a[href="#choose"]').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				var $me = $(this);
				$me.closest(".meta-content").find(":file").trigger("click");

				return false;
			}).end()

			.find(':file').on('change', function (e) {
				e.preventDefault();
				e.stopPropagation();

				var $me = $(this),
					path = ((this.files || [])[0] || {}).path || false
				;
				if (!path) return false;

				$me.closest(".meta-content").find(":text").val(path).trigger("change");

				return false;
			}).end()
		;

		return true;
	}

	/**
	 * Triggers system notification on item update
	 *
	 * @param {String} index Item index
	 * @param {String} txt New text line
	 *
	 * @return {Boolean}
	 */
	function notify (index, txt) {
		var watcher = log_queue[index],
			title = watcher.name
		;

		return !!SnitchNotifications.create(title, txt);
	}

	/**
	 * Updates output area with a line of text
	 *
	 * @param {String} index Item index
	 * @param {String} txt New text line
	 *
	 * @return {Boolean}
	 */
	function update (index, txt) {
		var $body = get_out_item(index);
		$body.html(
			$body.html() +
			Template.Out.ContentItem({txt: txt})
		);
		return true;
	}

	/**
	 * Initializes global UI events
	 *
	 * Horrible, needs better implementation
	 *
	 * @return {Boolean}
	 */
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
				.find('a[href="#choose"]').on('click', function (e) {
					e.preventDefault();
					e.stopPropagation();

					var $me = $(this);
					$me.closest(".meta-content").find(":file").trigger("click");

					return false;
				}).end()

				.find(':file').on('change', function (e) {
					e.preventDefault();
					e.stopPropagation();

					var $me = $(this),
						path = ((this.files || [])[0] || {}).path || false
					;
					if (!path) return false;

					$me.closest(".meta-content").find(":text").val(path).trigger("change");

					return false;
				}).end()

				.find('.save button').on('click', function (e) {
					e.preventDefault();
					e.stopPropagation();

					var item = {};
					$target.find('input,textarea').each(function () {
						var $me = $(this);
						item[$me.attr("name")] = $me.val();
					});
					Storage.add_item(item);
					window.location.reload();

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

		SnitchNotifications.init(); // Initialize notifications listeners

		return true;
	}

	/**
	 * Selects an active item
	 *
	 * @param {String} index Item index (optional, will fall back to first one available)
	 *
	 * @return {Boolean}
	 */
	function select_active (index) {
		index = index || $("#logs [data-id]").first().attr('data-id');
		make_active(index);

		return !!index;
	}

	module.exports = {
		add_watcher: add_watcher,
		get_queue: function () {
			return log_queue;
		},
		run: function () {
			initialize_ui_events();
			setTimeout(select_active);
		}
	};

})();
