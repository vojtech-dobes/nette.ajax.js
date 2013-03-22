var mouseflowPath;;

(function ($) {

$.nette.ext('mouseflow', {
	success: function (payload) {
		var url = payload.url || payload.redirect;
		if (window.mouseflow && url && !$.nette.ext('redirect')) {
			mouseflowPath = url;
			mouseflow.newPageView();
		}
	}
});

})(jQuery);
