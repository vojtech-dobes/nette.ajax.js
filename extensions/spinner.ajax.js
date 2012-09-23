(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = this.createSpinner();
		this.spinner.appendTo('body');
	},
	before: function () {
		this.spinner.show();
	},
	complete: function () {
		this.spinner.delay(this.delay).hide();
	}
}, {
	createSpinner: function () {
		return $('<div>', {
			id: 'ajax-spinner',
			style: {
				display: 'none'
			}
		});
	},
	spinner: null,
    delay: 400
});

})(jQuery);
