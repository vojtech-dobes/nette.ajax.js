(function($, undefined) {

/**
 * Shows barDumps from Ajax request
 */
$.nette.ext('diagnostics.dumps', {
	success: function (payload) {
		if (!payload.netteDumps || payload.netteDumps.length == 0) return;

		var $panel = this.getPanel(), $helper = $('<div>');
		$(this.getTitle(++this.counter)).appendTo($panel);

		$.each(payload.netteDumps, function (i, item) {
			if (item.title) $('<h2>', {
				text: item.title
			}).appendTo($helper);
			var $table = $('<table>').appendTo($helper), i = 0;
			$.each(item.dump, function (key, dump) {
				var $caption = $('<th>')
				$table.append($('<tr>', {
					'class': i++ % 2 ? 'nette-alt' : '', 
					html: '<th>' + key + '</th><td>' + dump + '</td>'
				}));
			});
		});
		$helper.children().appendTo($panel);

		this.notify();
	}
}, {
	counter: 0,
	getTitle: function (count) {
		return '<h2>Ajax request #' + count + '</h2>';
	},
	getTab: function () {
		if (!this.tab) this.tab = $('[rel=Nette-Diagnostics-DefaultBarPanel-4]');
		return this.tab;
	},
	getPanel: function () {
		if (!this.panel) this.panel = $('#nette-debug-panel-Nette-Diagnostics-DefaultBarPanel-4 .nette-DumpPanel');
		return this.panel;	
	},
	notify: function () {
		if (this.notified) return;
		$('<strong>', {
			text: ' [ajax!]',
			css: { fontWeight: 'bold' } }
		).appendTo(this.getTab());
		this.notified = true;
	}
});

})(jQuery);
