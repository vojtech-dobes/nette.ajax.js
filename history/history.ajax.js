(function($, undefined) {

// Is History API reliably supported? (based on Modernizr & PJAX)
if (!(window.history && history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/))) return;

$.nette.ext('redirect', false);

var findSnippets = function () {
	var result = [];
	$('[id^="snippet-"]').each(function () {
		var $el = $(this);
		result.push({
			id: $el.attr('id'),
			html: $el.html()
		});
	});
	return result;
};
var handleState = function (context, name, args) {
	var handler = context['handle' + name.substring(0, 1).toUpperCase() + name.substring(1)];
	if (handler) {
		handler.apply(context, args);
	}
};

$.nette.ext('history', {
	init: function () {
		var snippetsExt;
		if (this.cache && (snippetsExt = $.nette.ext('snippets'))) {
			this.handleUI = function (domCache) {
				$.each(domCache, function () {
					snippetsExt.updateSnippet(this.id, this.html, true);
				});
				$.nette.load();
			};
		}

		history.replaceState(this.initialState = {
			nette: true,
			href: window.location.href,
			title: document.title,
			ui: findSnippets()
		}, document.title, window.location.href);

		$(window).on('popstate.nette', $.proxy(function (e) {
			var state = e.originalEvent.state || this.initialState;
			if (window.history.ready || !state || !state.nette) return;
			if (this.cache && state.ui) {
				handleState(this, 'UI', [state.ui]);
				handleState(this, 'title', [state.title]);
			} else {
				$.nette.ajax({
					url: state.href,
					off: ['history']
				});
			}
		}, this));
	},
	before: function (xhr, settings) {
		if (!settings.nette) {
			this.href = null;
		} else if (!settings.nette.form) {
			this.href = settings.nette.ui.href;
		} else if (settings.nette.form.method == 'get') {
			this.href = settings.nette.ui.action || window.location.href;
		} else {
			this.href = null;
		}
	},
	success: function (payload) {
		var redirect = payload.redirect || payload.url; // backwards compatibility for 'url'
		if (redirect) {
			var regexp = new RegExp('//' + window.location.host + '($|/)');
			if ((redirect.substring(0,4) === 'http') ? regexp.test(redirect) : true) {
				this.href = redirect;
			} else {
				window.location.href = redirect;
			}
		}
		if (this.href && this.href != window.location.href) {
			history.pushState({
				nette: true,
				href: this.href,
				title: document.title,
				ui: findSnippets()
			}, document.title, this.href);
		}
		this.href = null;
	}
}, {
	href: null,
	cache: true,
	handleTitle: function (title) {
		document.title = title;
	}
});

})(jQuery);
