/**
 * AJAX Nette Framework plugin for jQuery
 *
 * @copyright Copyright (c) 2009, 2010 Jan Marek
 * @copyright Copyright (c) 2009, 2010 David Grudl
 * @copyright Copyright (c) 2012 Vojtěch Dobeš
 * @license MIT
 */

(function($, undefined) {

if (typeof $ != 'function') {
	return console.error('nette.ajax.js: jQuery is missing, load it please');
}

var nette = function () {
	var inner = {
		self: this,
		initialized: false,
		contexts: {},
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
			var props = args.shift();
			var name = (typeof props == 'string') ? props : props.name;
			var off = (typeof props == 'object') ? props.off || {} : {};
			args.push(inner.self);
			$.each(inner.on[name], function (index, reaction) {
				if (reaction === undefined || $.inArray(index, off) !== -1) return true;
				var temp = reaction.apply(inner.contexts[index], args);
				return result = (temp === undefined || temp);
			});
			return result;
		},
		requestHandler: function (e) {
			if (!inner.self.ajax({}, this, e)) return;
		},
		ext: function (callbacks, context, name) {
			while (!name) {
				name = 'ext_' + Math.random();
				if (inner.context[name]) {
					name = undefined;
				}
			}

			$.each(callbacks, function (event, callback) {
				inner.on[event][name] = callback;
			});
			inner.contexts[name] = $.extend(context ? context : {}, {
				name: function () {
					return name;
				},
				ext: function (name, force) {
					var ext = inner.contexts[name];
					if (!ext && force) throw "Extension '" + this.name() + "' depends on disabled extension '" + name + "'.";
					return ext;
				}
			});
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
	 * @return {$.nette|object} Provides a fluent interface OR returns extensions with given name
	 */
	this.ext = function (name, callbacks, context) {
		if (callbacks === undefined) {
			return inner.contexts[name];
		} else if (!callbacks) {
			$.each(['init', 'load', 'before', 'start', 'success', 'complete', 'error'], function (index, event) {
				inner.on[event][name] = undefined;
			});
			inner.contexts[name] = undefined;
		} else if (typeof name == 'string' && inner.contexts[name] !== undefined) {
			throw 'Cannot override already registered nette-ajax extension.';
		} else if (typeof name == 'object') {
			inner.ext(name, callbacks);
		} else {
			inner.ext(callbacks, context, name);
		}
		return this;
	};

	/**
	 * Initializes the plugin:
	 * - fires 'init' event, then 'load' event
	 * - when called with any arguments, it will override default 'init' extension
	 *   with provided callbacks
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
		if (!settings.nette && ui && e) {
			var $el = $(ui);
			var analyze = settings.nette = {
				ui: ui,
				el: $el,
				isForm: $el.is('form'),
				isSubmit: $el.is('input[type=submit]'),
				isImage: $el.is('input[type=image]'),
				form: null
			};

			if (analyze.isSubmit || analyze.isImage) {
				analyze.form = analyze.el.closest('form');
			} else if (analyze.isForm) {
				analyze.form = analyze.el;
			}

			if (!settings.url) {
				settings.url = analyze.form ? analyze.form.attr('action') : ui.href;
			}
			if (!settings.type) {
				settings.type = analyze.form ? analyze.form.attr('method') : 'get';
			}

			if ($el.is('[data-ajax-off]')) {
				settings.off = $el.data('ajaxOff');
				if (typeof settings.off == 'string') setting.off = [settings.off];
			}
		}

		if (!inner.fire({
			name: 'before',
			off: settings.off || {}
		}, settings, ui, e)) return;

		return $.ajax($.extend({
			beforeSend: function (xhr) {
				return inner.fire({
					name: 'start',
					off: settings.off || {}
				}, xhr);
			}
		}, settings)).done(function (payload) {
			inner.fire({
				name: 'success',
				off: settings.off || {}
			}, payload);
		}).fail(function (xhr, status, error) {
			inner.fire({
				name :'error',
				off: settings.off || {}
			}, xhr, status, error);
		}).always(function () {
			inner.fire({
				name: 'complete',
				off: settings.off || {}
			});
		});
	};
};

$.nette = new ($.extend(nette, $.nette ? $.nette : {}));

$.fn.netteAjax = function (e, options) {
	return $.nette.ajax(options || {}, this[0], e);
};

$.nette.ext('validation', {
	before: function (settings, ui, e) {
		if (!settings.nette || !e) return true;
		else var analyze = settings.nette;

		var validate = $.extend({
			keys: true,
			url: true,
			form: true
		}, settings.validate || (function () {
			if (!analyze.el.is('[data-ajax-validate]')) return;
			var attr = analyze.el.data('ajaxValidate');
			if (attr === false) return {
				keys: false,
				url: false,
				form: false
			}; else if (typeof attr == 'object') return attr;
 		})() || {});

		if (validate.keys) {
			// thx to @vrana
			var explicitNoAjax = e.button || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;

			if (analyze.form) {
				if (explicitNoAjax && analyze.isSubmit) {
					this.explicitNoAjax = true;
					return false;
				} else if (analyze.isForm && this.explicitNoAjax) {
					this.explicitNoAjax = false;
					return false;
				}
			} else if (explicitNoAjax) return false;
		}

		if (validate.form && analyze.form && !((analyze.isSubmit || analyze.isImage) && analyze.el.attr('formnovalidate') !== undefined)) {
			if (analyze.form.get(0).onsubmit && !analyze.form.get(0).onsubmit()) {
				e.stopImmediatePropagation();
				e.preventDefault();
				return false;
			}
		}

		if (validate.url) {
			// thx to @vrana
			if (/:|^#/.test(analyze.form ? settings.url : analyze.el.attr('href'))) return false;
		}

		e.stopPropagation();
		e.preventDefault();
		return true;
	}
}, {
	explicitNoAjax: false
});

$.nette.ext('forms', {
	success: function (payload) {
		var snippets;
		if (!window.Nette || !payload.snippets || !(snippets = this.ext('snippets'))) return;

		for (var id in payload.snippets) {
			snippets.getElement(id).find('form').each(function() {
				window.Nette.initForm(this);
			});
		}
	},
	before: function (settings, ui, e) {
		var analyze = settings.nette;
		if (!analyze || !analyze.form) return;

		settings.data = settings.data || {};

		if (analyze.isSubmit) {
			settings.data[analyze.el.attr('name')] = analyze.el.val() || '';
		} else if (analyze.isImage) {
			var offset = analyze.el.offset();
			var name = analyze.el.attr('name');
			var dataOffset = [ Math.max(0, e.pageX - offset.left), Math.max(0, e.pageY - offset.top) ];

			if (name.indexOf('[', 0) !== -1) { // inside a container
				settings.data[name] = dataOffset;
			} else {
				settings.data[name + '.x'] = dataOffset[0];
				settings.data[name + '.y'] = dataOffset[1];
			}
		}

		settings.data = this.serializeValues(analyze.form, settings.data);
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
		if (this.xhr) {
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
	buttonSelector: 'input.ajax[type="submit"], input.ajax[type="image"]'
});

})(window.jQuery);
