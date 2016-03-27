// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// Thanks to fearphage and Brad Larson
if (!String.prototype.format) { // Just to be safe.
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}
