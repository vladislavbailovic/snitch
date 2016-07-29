;(function (undefined) {
	"use strict";
	
	function format_structure (data) {
		return JSON.stringify(data, null, "\t");
	}

	function json_decode (txt) {
		var data = false;

		try {
			data = JSON.parse(txt);
		} catch (e) {}

		return data ? format_structure(data) : txt;
	}

	module.exports = {
		json_decode: json_decode
	};
})();
