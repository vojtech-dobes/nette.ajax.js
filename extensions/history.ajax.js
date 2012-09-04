(function($, undefined) {

// change URL (requires HTML5)
if (!(window.history && history.pushState)) return; // check borrowed from Modernizr

$.nette.ext('history', {
	before: function (settings, ui) {
		var $el = $(ui);
		if ($el.is('a')) {
			this.href = ui.href;
		}
	},
	success: function (payload) {
		if (payload.url) {
			this.href = payload.url;
		}
		if (!payload.signal && this.href) {
			history.pushState({href: this.href}, '', this.href);
		}
	}
}, {href: null});

})(jQuery);
