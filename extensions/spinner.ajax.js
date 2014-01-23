(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = this.createSpinner();
		this.spinner.appendTo('body');
	},
	start: function () {
		this.counter++;
		if (this.counter === 1) {
			this.spinner.show(this.speed);
		}
	},
	complete: function () {
		this.counter--;
		if (this.counter <= 0) {
			this.spinner.hide(this.speed);
		}
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
	speed: undefined,
	counter: 0
});

})(jQuery);
