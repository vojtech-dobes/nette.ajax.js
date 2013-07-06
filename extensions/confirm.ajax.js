(function($, undefined) {

$.nette.ext({
	before: function (xhr, settings) {
		if (!settings.nette) {
			return;
		}

		var question = settings.nette.el.data('confirm');
		if (question) {
			return confirm(question);
		}
	}
});

})(jQuery);
