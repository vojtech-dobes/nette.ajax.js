(function($, undefined) {

// Is History API reliably supported? (based on Modernizr & PJAX)
if (!(window.history && history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/))) return;

// thx to @ic (http://forum.nette.org/cs/profile.php?id=1985, http://forum.nette.org/cs/4405-flash-zpravicky-bez-fid-v-url#p43713)

$.nette.ext('fidRemove', {
	init: function () {
		var that = this;
		setTimeout(function () {
			var url = window.location.toString();
			var pos = url.indexOf('_fid=');
			if (pos !== -1) {
				window.history.replaceState({}, null, that.removeFid(url, pos));
			}
		}, this.timeout);
	}
}, {
	timeout: 3000,
	removeFid: function (url, pos) {
		if ((url.substr(url.length - 1) === '?') || (url.substr(url.length - 1) === '&')) {
			url = url.substr(0, url.length - 1);
		url = url.substr(0, pos) + url.substr(pos + 9);
		}
		return url;
	}
});

})(jQuery);
