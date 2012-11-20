(function($, undefined) {

/**
 * Depends on 'snippets' extension
 */
$.nette.ext('scrollTo', {
	init: function () {
		this.ext('snippets', true).before($.proxy(function ($el) {
			if (this.shouldTry && $el.eq(0).tagName != 'TITLE') {
				var offset = $el.offset();
				scrollTo(offset.left, offset.top);
				this.shouldTry = false;
			}
		}), this);
	},
	success: function (payload) {
		this.shouldTry = true;
	}
}, {
	shouldTry: true
});

})(jQuery);
