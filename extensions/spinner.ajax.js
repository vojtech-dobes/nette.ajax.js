(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = this.createSpinner();
		this.spinner.appendTo('body');
	},
	start: function () {
		this.spinner.show(this.speed);
	},
	complete: function () {
		this.spinner.hide(this.speed);
	}
}, {
	createSpinner: function () {
		return $('<div>', {
			id: 'ajax-spinner',
			css: {
				display: 'none'
			}
		});
	},
	spinner: null,
	speed: undefined
});

})(jQuery);
