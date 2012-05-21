
$(function () {
	$.nette.ext('spinner').context.speed = 2000;
	$.nette.ext('redirect').on.success = function (payload) {
		if (payload.redirect) {
			console.error('zapomenty redirect');
		}
	};

	$.nette.init({
		load: function (h) {
			$('a.ajax').off('click', h).on('click', h);
		},
		success: function (payload, nette) {
			nette.load();
		}
	});
});
