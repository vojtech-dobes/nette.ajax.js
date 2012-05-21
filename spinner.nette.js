(function($, undefined) {

$.nette.ext('spinner', {
	init: function () {
		this.spinner = $('<div></div>').attr('id', this.spinnerId).appendTo('body').hide();
	},
	before: function () {
		this.spinner.show(this.speed);
	},
	complete: function () {
		this.spinner.hide(this.speed);
	}
}, {
	spinner: null,
	spinnerId: 'ajax-spinner',
	speed: undefined,
});

})(jQuery);
