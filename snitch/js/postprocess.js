;(function (undefined) {

	function format_structure (data) {
		return '[[' + JSON.stringify(data) + ']]';
	}

	function json_decode (txt) {
		var data = false;

		try {
			data = JSON.parse(txt);
		} catch (e) {
			console.log("jesus fuck", txt, e)
		}

		return data ? format_structure(data) : txt;
	}

	module.exports = {
		json_decode: json_decode
	};
})();
