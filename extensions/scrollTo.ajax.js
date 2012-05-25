(function($, undefined) {

/**
 * Depends on 'snippets' extension
 */
$.nette.ext('scrollTo', {
	success: function (payload) {
		var snippetsExtension = this.ext('snippets');
		if (payload.snippets) {
			for (var id in payload.snippets) {
				var $el = snippetsExtension.getElement(id);
				if ($el.eq(0).tagName != 'TITLE') {
					var offset = $el.offset();
					scrollTo(offset.left, offset.top);
					break;
				}
			}
		}
	}
});

})(jQuery);
