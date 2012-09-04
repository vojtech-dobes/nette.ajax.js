(function($, undefined) {

// change URL (requires HTML5)
if (!(window.history && history.pushState)) return; // check borrowed from Modernizr

$.nette.ext('redirect', false);

$.nette.ext('history', {
	before: function (settings, ui) {
		if (!settings.nette) return;
		if (!settings.nette.form) {
			this.href = settings.nette.ui.href;
		} else if (settings.nette.form.method == 'get') {
			this.href = settings.nette.ui.action;
		}
	},
	success: function (payload) {
		if (payload.redirect) {
			this.href = payload.redirect;
		}
		if (this.href && this.href != window.location.href) {
			history.pushState({href: this.href}, '', this.href);
		}
	}
}, {href: null});

})(jQuery);
