(function ($, _gaq) {

$.nette.ext('ga', {
	success: function (payload) {
		var url = payload.url || payload.redirect;
		if (url && !$.nette.ext('redirect')) {
			_gaq.push(['_trackPageview', url]);
		}
	}
});

})(jQuery, _gaq);
