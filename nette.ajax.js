/**
 * AJAX Nette Framework plugin for jQuery
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
			var analyze = inner.self.analyze(this);
			analyze.explicitNoAjax = e.button || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey; // thx to @vrana

			if (!inner.self.validateEvent(analyze, e)) return;

			inner.self.ajax({
				nette: analyze
			}, this, e);
		}
	};

	/**
	 * Analyzes element for further checks
	 *
	 * @param  {Element}
	 * @return {object}
	 */
	this.analyze = function (ui) {
		var $el = $(ui);
		var analyze = {
			ui: ui,
			el: $el,
			isForm: $el.is('form'),
			isSubmit: $el.is(':submit'),
			isImage: $el.is(':image'),
			form: null,
			explicitNoAjax: false
		};

		if (analyze.isSubmit || analyze.isImage) {
			analyze.form = analyze.el.closest('form');
		} else if (analyze.isForm) {
			analyze.form = analyze.el;
		}

		analyze.url = analyze.form ? analyze.form.attr('action') : this.href;
		analyze.type = analyze.form ? analyze.form.attr('method') : 'get';

		return analyze;
	};

	/**
	 * Utilizes few checks whether request should be ajaxified
	 * - pressing CTRL, SHIFT or ALT
	 * - validation of form
	 * - fragments in URL or absolute paths
	 *
	 * @param  {object}
	 * @param  {event}
	 * @return {bool}
	 */
	this.validateEvent = function (analyze, e) {
		if (analyze.form) {
			if (analyze.explicitNoAjax && analyze.isSubmit) {
				inner.explicitNoAjax = true;
				return false;
			} else if (analyze.isForm && inner.explicitNoAjax) {
				inner.explicitNoAjax = false;
				return false;
			}

			if (analyze.form.get(0).onsubmit && !analyze.form.get(0).onsubmit()) return false;
		} else if (analyze.explicitNoAjax) return false;

		// thx to @vrana
		if (/:|^#/.test(analyze.form ? analyze.form.attr('action') : analyze.el.attr('href'))) return false;

		e.stopPropagation();
		e.preventDefault();
		return true;
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
	 * @return {$.nette|object} Provides a fluent interface OR returns extensions with given name
	 */
	this.ext = function (name, callbacks, context) {
		if (inner.initialized) throw 'Cannot manipulate nette-ajax extensions after initialization.';

		if (callbacks === undefined) {
			return inner.extensions[name];
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
					inner.contexts[extension.name] = $.extend(extension.context ? extension.context : {}, {
						ext: function (name) {
							var ext = inner.contexts[name];
							if (!ext) throw "Extension '" + extension.name + "' depends on disabled extension '" + name + "'.";
							return ext;
						}
					});
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

	/**
	 * Executes AJAX request. Attaches listeners and events.
	 *
	 * @param  {object} settings
	 * @param  {Element|null} ussually Anchor or Form
	 * @param  {event|null} event causing the request
	 * @return {jqXHR|null}
	 */
	this.ajax = function (settings, ui, e) {
		settings.data = settings.data || {};

		if (!settings.nette && ui && e) {
			settings.nette = this.analyze(ui);
			if (!this.validateEvent(settings.nette, e)) return;
		}
		if (!settings.url) settings.url = settings.nette.url;
		if (!settings.type) settings.type = settings.nette.type;

		if (!inner.fire('before', settings, ui, e)) return;

		return $.ajax($.extend({
			beforeSend: function (xhr) {
				return inner.fire('start', xhr);
			}
		}, settings)).done(function (payload) {
			inner.fire('success', payload);
		}).fail(function (xhr, status, error) {
			inner.fire('error', xhr, status, error);
		}).always(function () {
			inner.fire('complete');
		});
	};
};

$.nette = new ($.extend(nette, $.nette ? $.nette : {}));

$.nette.ext('forms', {
	before: function (settings, ui, e) {
		var req = settings.nette;
		if (!req || !req.form) return;

		if (req.isSubmit) {
			settings.data[req.el.attr('name')] = req.el.val() || '';
		} else if (req.isImage) {
			var offset = req.el.offset();
			var name = req.el.attr('name');
			settings.data[name + '.x'] = e.pageX - offset.left;
			settings.data[name + '.y'] = e.pageY - offset.top;
		}

		settings.data = this.serializeValues(req.form, settings.data);
	}
}, {
	serializeValues: function ($form, data) {
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
		return data;
	}
});

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
		var $el = this.getElement(id);
		// Fix for setting document title in IE
		if ($el.eq(0).tagName == 'TITLE') {
			document.title = html;
		} else {
			this.applySnippet($el, html);
		}
	},
	getElement: function (id) {
		return $('#' + this.escapeSelector(id));
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
if (!!(window.history && history.pushState)) { // check borrowed from Modernizr
	$.nette.ext('history', {
		init: function () {
			history.pushState({href: document.URL}, '', document.URL);
			$(window).bind('popstate', $.proxy( this.doPopstate, this ));
		},
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
			if (!this.popstate && !payload.signal && window.history && history.pushState && this.href) {
				history.pushState({href: this.href}, '', this.href);
			}
			this.popstate = null;
		}
	}, {
		href: null,
		popstate: null,
		doPopstate: function (event) {
			this.popstate = true;
			if (!event.originalEvent.state) return;
			$.nette.ajax({
				url: event.originalEvent.state.href
			});
		}
	});
}

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

// default ajaxification (can be overridden in init())
$.nette.ext('init', {
	load: function (rh) {
		$(this.linkSelector).off('click.nette', rh).on('click.nette', rh);
		var $forms = $(this.formSelector);
		$forms.off('submit.nette', rh).on('submit.nette', rh);
		$forms.off('click.nette', ':image', rh).on('click.nette', ':image', rh);
		$forms.off('click.nette', ':submit', rh).on('click.nette', ':submit', rh);

		var buttonSelector = this.buttonSelector;
		$(buttonSelector).each(function () {
			$(this).closest('form')
				.off('click.nette', buttonSelector, rh)
				.on('click.nette', buttonSelector, rh);
		});
	},
	success: function () {
		$.nette.load();
	}
}, {
	linkSelector: 'a.ajax',
	formSelector: 'form.ajax',
	buttonSelector: 'input.ajax:submit'
});

})(jQuery);
