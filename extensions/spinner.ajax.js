(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = this.createSpinner();
		this.spinner.appendTo('body');
	},
	before: function () {
		this.spinner.show(this.speed);
	},
	complete: function () {
		this.spinner.hide(this.speed);
	}
}, {
	createSpinner: function () {
		return $('<div>', {
			id: 'ajax-spinner',
			style: 'display: none;'
		});
	},
	spinner: null,
	speed: undefined
});

})(jQuery);
