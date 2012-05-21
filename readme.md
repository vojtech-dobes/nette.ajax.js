## For Nette Framework

Flexible utility script for AJAX. Supports snippets, redirects etc.

## License

MIT

## Installation

1. Get the source code from Github.
2. Move `jquery.nette-ajax.js` to your directory with Javascript files.
3. Link the file in your templates.
4. Put somewhere the initialization routine. See `main.js` for inspiration.

## Usage

It works as a jQuery plugin. As well known `jquery.nette.js`, it installs itself into `$.nette`. But similarities end here.

You have to explicitly initialize plugin via method `init`. It accepts hash of callbacks, or if only function is provided, callback for `load` event. You should ajaxify all elements you wish here with handler which yout callback will get as first argument.

```js
$.nette.init(function (handler) {
	$('a.ajax').click(handler);
});
```

Another useful routine is registering reajaxification after snippets invalidation. Of course, you may use `live()`, but it's not too effective. Rather reload the plugin after successful request. See updated code:

```js
$.nette.init({
	load: function (h) {
		$('a.ajax').off('click', h).on('click', handler);
	},
	success: function () {
		$.nette.load();
	}
});
```

You're ready to go.

## Extensions

Almost every functionality is implemented via set of 6 available events under the hood. You may hook them via concept of extensions. Every extension consists of 3 elements: name, set of event callbacks and some default context for storing values etc.

```js
$.nette.ext('name', {
	nameOfEvent: function () { ... },
	...
}, {foo: bar});
```

Context is shared in every event callbacks and accessible via `this`.

Extension may implement all 6 events or just one. Available events are these:

- `init` -  called just once
- `load (ajaxHandler)` - may be called more times (called at the end of `init()` method automatically)
- `before (ui)` - called before AJAX request is created
- `start (req)` - called immediatelly after creation of request
- `success (payload)` - called after successful request
- `complete` - called after any request

Event callbacks receive arguments as shown in parentheses. All of them also get instance of plugin itself as last argument. That means both markups are equivalent:

```js
success: function () {
	$.nette.load();
}
```

```js
success: function (nette) {
	nette.load();
}
```

Extension may be disabled by calling: `$.nette.ext('name', null);`. You can also modify it directly - just grab the instance of extension by calling `$.nette.ext('name');` without other arguments. Structure of extension:

```js
// event callbacks are in 'on' namespace
$.nette.ext('snippets').on.complete
```

```js
// context of extension
$.nette.ext('unique').context
```

Any manipulation with extensions is forbidden after the initialization. Please setup everything before `init()` call.

## Default extensions

### Snippets

Classic implementation from the original script.

### Redirect

Classic implementation from the original script also.

### History

Takes care of saving the state to browser history if possible.

### Unique

Ensures there is always just one request running.
