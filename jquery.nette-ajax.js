/**
 * AJAX Nette Framwork plugin for jQuery
 *
 * @copyright Copyright (c) 2009, 2010 Jan Marek
 * @copyright Copyright (c) 2009, 2010 David Grudl
 * @copyright Copyright (c) 2012 Vojtěch Dobeš
 * @license MIT
 */

(function($, undefined) {

if (typeof $ != 'function') return;

var nette = function () {
	var inner = {
		self: this,
		initialized: false,
		contexts: {},
		extensions: {},
		on: {
			init: {},
			load: {},
			before: {},
			start: {},
			success: {},
			complete: {}
		},
		fire: function () {
			var result = true;
			var args = Array.prototype.slice.call(arguments);
			var name = args.shift();
			args.push(inner.self);
			$.each(inner.on[name], function (index, reaction) {
				var temp = reaction.apply(inner.contexts[index], args);
				return result = (temp === undefined || temp);
			});
			return result;
		},
		requestHandler: function (e) {
			e.preventDefault();
			if (inner.fire('before', this)) {
				var req = $.post(this.href, {}, function (payload) {
					inner.fire('success', payload);
				}).complete(function () {
					inner.fire('complete');
				});
				inner.fire('start', req);
			}
		}
	};

	this.ext = function (name, callbacks, context) {
		if (inner.initialized) throw 'Cannot manipulate nette-ajax extensions after initialization.';

		if (callbacks === undefined) {
			return inner.extensions[name];
		} else if (!callbacks) {
			inner.extensions[name] = undefined;
			return this;
		} else if (inner.extensions[name]) {
			throw 'Cannot override already registered nette-ajax extension.';
		} else {
			return inner.extensions[name] = {
				name: name,
				on: callbacks,
				context: context
			};
		}
	};

	this.init = function (load, loadContext) {
		if (typeof load == 'function') {
			this.ext('n:init', {
				load: load,
			}, loadContext);
		} else if (typeof load == 'object') {
			this.ext('n:init', load, loadContext);
		} else if (load !== undefined) {
			throw 'Argument of init() can be function or function-hash only.';
		} else {
			if (inner.initialized) throw 'Cannot initialize nette-ajax twice.';
		}

		inner.initialized = true;

		$.each(inner.extensions, function (index, extension) {
			$.each(['init', 'load', 'before', 'start', 'success', 'complete'], function (index, reaction) {
				if (extension !== undefined) {
					if (extension.on[reaction] !== undefined) {
						inner.on[reaction][extension.name] = extension.on[reaction];
					}
					inner.contexts[extension.name] = extension.context ? extension.context : {};
				}
			});
		});

		inner.fire('init');
		this.load();
		return this;
	};

	this.load = function () {
		inner.fire('load', inner.requestHandler);
	};
};

$.nette = new ($.extend(nette, $.nette ? $.nette : {}));

// default snippet handler
$.nette.ext('snippets', {
	success: function (payload) {
		if (payload.snippets) {
			for (var i in payload.snippets) {
				this.updateSnippet(i, payload.snippets[i]);
			}
		}
	}
}, {
	updateSnippet: function (id, html) {
		var $el = $('#' + id);
		// Fix for setting document title in IE
		if ($el.eq(0).tagName == 'TITLE') {
			document.title = html;
		} else {
			this.applySnippet($el, html);
		}
	},
	applySnippet: function ($el, html) {
		$el.html(html);
	}
});

// support $this->redirect()
$.nette.ext('redirect', {
	success: function (payload) {
		if (payload.redirect) {
			window.location.href = payload.redirect;
			return false;
		}
	}
});

// change URL (requires HTML5)
$.nette.ext('history', {
	before: function (ui) {
		this.href = ui.href;
	},
	success: function (payload) {
		if (payload.url) {
			this.href = payload.url;
		}
		if (!payload.signal && window.history && history.pushState && this.href) {
			history.pushState({href: this.href}, '', this.href);
		}
	}
}, {href: null});

// current page state
$.nette.ext('state', {
	success: function (payload) {
		if (payload.state) {
			this.state = payload.state;
		}
	}
}, {state: null});

// abort last request if new started
$.nette.ext('unique', {
	start: function (req) {
		if (this.req) {
			this.req.abort();
		}
		this.req = req;
	},
	complete: function () {
		this.req = null;
	}
}, {req: null});

})(jQuery);
