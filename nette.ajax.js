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
			complete: {},
			error: {}
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
		explicitNoAjax: false,
		requestHandler: function (e) {
			e.stopPropagation();

			// thx to @vrana
			var explicitNoAjax = e.button || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;

			var $el = $(this), $form, isForm, isSubmit, data = {};
			if ((isForm = $el.is('form')) || (isSubmit = $el.is(':submit'))) {
				if (isSubmit) {
					$form = $el.closest('form');
					data[$el.attr('name')] = $el.val() || '';
				} else if (isForm) {
					$form = $el;
				} else {
					return;
				}

				if (explicitNoAjax && isSubmit) {
					inner.explicitNoAjax = true;
					return;
				} else if (isForm && inner.explicitNoAjax) {
					inner.explicitNoAjax = false;
					return;
				}

				if ($form.get(0).onsubmit && !$form.get(0).onsubmit()) return null;

				var values = $form.serializeArray();
				for (var i = 0; i < values.length; i++) {
					var name = values[i].name;
					if (name in data) {
						var val = data[name];
						if (!(val instanceof Array)) {
							val = [val];
						}
						val.push(values[i].value);
						data[name] = val;
					} else {
						data[name] = values[i].value;
					}
				}
			} else if (explicitNoAjax) return;

			// thx to @vrana
			if (/:|^#/.test($form ? $form.attr('action') : $el.attr('href'))) return;

			if (inner.fire('before', this)) {
				e.preventDefault();
				var xhr = $.ajax({
					url: $form ? $form.attr('action') : this.href,
					data: data,
					type: $form ? $form.attr('method') : 'get',
					success: function (payload) {
						inner.fire('success', payload);
					},
					complete: function () {
						inner.fire('complete');
					},
					error: function () {
						inner.fire('error');
					}
				});
				inner.fire('start', xhr);
			}
		}
	};

	/**
	 * Allows manipulation with extensions.
	 * When called with 1. argument only, it returns extension with given name.
	 * When called with 2. argument equal to false, it removes extension entirely.
	 * When called with 2. argument equal to hash of event callbacks, it adds new extension.
	 *
	 * @param  {string} Name of extension
	 * @param  {bool|object|null} Set of callbacks for any events OR false for removing extension.
	 * @param  {object|null} Context for added extension
	 * @return {$.nette} Provides a fluent interface
	 */
	this.ext = function (name, callbacks, context) {
		if (inner.initialized) throw 'Cannot manipulate nette-ajax extensions after initialization.';

		if (callbacks === undefined) {
			inner.extensions[name];
		} else if (!callbacks) {
			inner.extensions[name] = undefined;
		} else if (inner.extensions[name]) {
			throw 'Cannot override already registered nette-ajax extension.';
		} else {
			inner.extensions[name] = {
				name: name,
				on: callbacks,
				context: context
			};
		}
		return this;
	};

	/**
	 * Initializes the plugin. Forbids any further modifications of extensions.
	 * Fires 'init' event, then 'load' event.
	 * When called with any arguments, it will overried default 'init' extension
	 * with provided callbacks.
	 *
	 * @param  {function|object|null} Callback for 'load' event or entire set of callbacks for any events
	 * @param  {object|null} Context provided for callbacks in first argument
	 * @return {$.nette} Provides a fluent interface
	 */
	this.init = function (load, loadContext) {
		if (inner.initialized) throw 'Cannot initialize nette-ajax twice.';

		if (typeof load == 'function') {
			this.ext('init', null);
			this.ext('init', {
				load: load
			}, loadContext);
		} else if (typeof load == 'object') {
			this.ext('init', null);
			this.ext('init', load, loadContext);
		} else if (load !== undefined) {
			throw 'Argument of init() can be function or function-hash only.';
		}

		inner.initialized = true;

		$.each(inner.extensions, function (index, extension) {
			$.each(['init', 'load', 'before', 'start', 'success', 'complete', 'error'], function (index, reaction) {
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

	/**
	 * Fires 'load' event
	 *
	 * @return {$.nette} Provides a fluent interface
	 */
	this.load = function () {
		inner.fire('load', inner.requestHandler);
		return this;
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
		var $el = $('#' + this.escapeSelector(id));
		// Fix for setting document title in IE
		if ($el.eq(0).tagName == 'TITLE') {
			document.title = html;
		} else {
			this.applySnippet($el, html);
		}
	},
	applySnippet: function ($el, html) {
		$el.html(html);
	},
	escapeSelector: function (selector) {
		// thx to @uestla (https://github.com/uestla)
		return selector.replace(/[\!"#\$%&'\(\)\*\+,\.\/:;<=>\?@\[\\\]\^`\{\|\}~]/g, '\\$&');
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
		var $el = $(ui);
		if ($el.is('a')) {
			this.href = ui.href;
		}
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
	start: function (xhr) {
		if (this.req) {
			this.xhr.abort();
		}
		this.xhr = xhr;
	},
	complete: function () {
		this.xhr = null;
	}
}, {xhr: null});

// option to abort by ESC (thx to @vrana)
$.nette.ext('abort', {
	init: function () {
		$('body').keydown($.proxy(function (e) {
			if (this.xhr && (e.keyCode == 27 // Esc
			&& !(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey))
			) {
				this.xhr.abort();
			}
		}, this));
	},
	start: function (xhr) {
		this.xhr = xhr;
	},
	complete: function () {
		this.xhr = null;
	}
}, {xhr: null});

// default ajaxification (can be overriden in init())
$.nette.ext('init', {
	load: function (rh) {
		$(this.linkSelector).off('click', rh).on('click', rh);
		var $forms = $(this.formSelector);
		$forms.off('submit', rh).on('submit', rh);
		$forms.off('click', ':submit', rh).on('click', ':submit', rh);
	},
	success: function () {
		$.nette.load();
	}
}, {
	linkSelector: 'a.ajax',
	formSelector: 'form.ajax'
});

})(jQuery);
