(function($, undefined) {

// change URL (requires HTML5)
if (!(window.history && history.pushState)) return; // check borrowed from Modernizr

$.nette.ext('redirect', false);

var findSnippets = function () {
	var result = [];
	$('[id^="snippet--"]').each(function () {
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
					snippetsExt.updateSnippet(this.id, this.html);
				});
				$.nette.load();
			};
		}

		this.initialState = {
			nette: true,
			href: window.location.href,
			title: document.title,
			ui: findSnippets()
		};

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
	before: function (settings, ui) {
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
		if (payload.redirect) {
			this.href = payload.redirect;
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
