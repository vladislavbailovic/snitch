;(function () {
	"use strict";

	var Ipc = require('electron').ipcRenderer,
		Crypto = require('crypto')
	;

	var notifications_queue = {};

	/**
	 * Creates a new notification
	 *
	 * @param {String} title Message title
	 * @param {String} text Message body text
	 *
	 * @return {Boolean}
	 */
	function create_notification (title, text) {
		var hash = Crypto.createHash('sha1'),
			idx = false
		;

		hash.update(title);
		hash.update(text);
		idx = hash.digest('hex');

		if (!idx) return false; // Can't deal with empty index
		if (notifications_queue[idx]) return false; // Already notified about this one

		notifications_queue[idx] = new Notification(title, { body: text });
		notifications_queue[idx].onclick = function () {
			Ipc.send('clear-notifications-queue');
		};

		// Also expire the notice after a while
		setTimeout(function () {
			clear_notification(idx);
		}, 5000);

		return idx;
	}

	/**
	 * Clear individual notification
	 *
	 * @param {String} idx Notification index
	 *
	 * @return {Boolean}
	 */
	function clear_notification (idx) {
		if (notifications_queue && notifications_queue[idx]) {
			if (notifications_queue[idx].close) notifications_queue[idx].close();
			delete(notifications_queue[idx]);

			return true;
		}
		return false;
	}

	/**
	 * Clears all notifications in queue
	 *
	 * @return {Boolean}
	 */
	function clear_all_notifications () {
		for (var idx in notifications_queue) {
			clear_notification(idx);
		}
		return true;
	}

	Ipc.on('clear-notifications-queue', function () {
		console.log("clearing all notifications");
		clear_all_notifications();
	});

	module.exports = {

	};
})();
