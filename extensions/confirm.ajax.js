(function($, undefined) {

$.nette.ext({
  before: function (xhr, settings) {
		var question = settings.nette.el.data('confirm');
		if (question) {
			return confirm(question);
		}
	}
});

})(jQuery);
