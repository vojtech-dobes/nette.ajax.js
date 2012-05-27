(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = this.createSpinner();
		this.spinner.appendTo('body').hide();
	},
	before: function () {
		this.spinner.show(this.speed);
	},
	complete: function () {
		this.spinner.hide(this.speed);
	}
}, {
	createSpinner: function () {
		return $('<div></div>').attr('id', 'ajax-spinner');
	},
	spinner: null,
	speed: undefined
});

})(jQuery);
