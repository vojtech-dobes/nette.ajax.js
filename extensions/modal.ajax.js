(function($, undefined) {

$.nette.ext({
	before: function (xhr, settings) {
		if (!settings.nette) {
			return;
		}
		$.nette.ext('spinner', null);
		this.el = settings.nette.el;
	},
	success: function(payload) {
		var modal = this.el.data('toggle') == 'modal';
		if (modal) {
			var url = this.el.attr('href');
			if (url.indexOf('#') == 0) {
				$(url).modal('open');
			} else {
				$('<div class="modal hide fade">' + payload + '</div>').modal();
			}
		}
		return false;
	}
});

})(jQuery);
