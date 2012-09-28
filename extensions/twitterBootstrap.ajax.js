(function($, undefined) {

$.nette.ext('twitterBootstrap', {
	start: function (xhr, settings) {
		if (!settings.nette) return;

		var $el = settings.nette.el;
		$el.closest('.dropdown').find('[data-toggle="dropdown"]').trigger($.Event('keydown', {
			keyCode: 27
		}));
	}
});

})(jQuery);
