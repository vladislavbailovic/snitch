;(function (undefined) {
	"use strict";

	function format_structure (data) {
		return JSON.stringify(data, null, "\t");
	}

	/**
	 * Attempts parsing raw log line into message object
	 *
	 * A message object contains separate headers and message properties
	 *
	 * @param {String} txt Raw log message
	 *
	 * @return {Object} Log message object
	 */
	function parse_log_line (txt) {
		var res = [],
			msg = {
				header: '',
				message: ''
			}
		;

		res = txt.match(/^\[([^\]]+)\]\s*(.*?)$/); // Attempt to match raw log headers
		if (res && 3 === res.length) {
			msg.header = res[1];
			msg.message = res[2];
		}

		return msg;
	}

	function json_decode (txt) {
		var data = false,
			msg = parse_log_line(txt)
		;

		if (!msg.message) return txt;

		try {
			data = JSON.parse(msg.message);
		} catch (e) {}

		if (!data) return txt;

		return '[' + msg.header + ']' + format_structure(data);
	}

	module.exports = {
		json_decode: json_decode
	};
})();
