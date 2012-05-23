## For Nette Framework

Flexible utility script for AJAX. Supports snippets, redirects etc.

## License

MIT

## Dependencies

- jQuery 1.7

## Installation

1. Get the source code from Github.
2. Move `nette.ajax.js` to your directory with Javascript files.
3. Link the file in your templates.
4. Put somewhere the initialization routine. See `example.js` for inspiration.

## Usage

It works as a jQuery plugin. As well known `jquery.nette.js`, it installs itself into `$.nette`. But similarities end here.

You have to explicitly initialize plugin via method `init`. Plugin has predefined hooks for links and forms with `ajax` CSS class. It may be enough for you. If you want to change the behavior, you may:

* Alter the selectors via setting `$.nette.ext('init').context.linkSelector` or `$.nette.ext('init').context.formSelector` to whatever you wish.
* Or you may redefine ajaxifying routine completely.

Method `init()` accepts hash of event callbacks (if you provide just function instead, it will be considered callback for `load` event). `load` event callback is the right place, where you should ajaxify all elements you want. Callback will be called with with `handler` function as first argument:

```js
$.nette.init(function (handler) {
	$('a.ajax').click(handler);
});
```

That way or another, you're ready to go.

## Extensions

Almost every functionality is implemented via set of 7 available events under the hood. You may hook them via concept of extensions. Every extension consists of 3 elements: name, set of event callbacks and some default context for storing values etc.

```js
$.nette.ext('name', {
	nameOfEvent: function () { ... },
	...
}, {foo: bar});
```

Context is shared in every event callbacks and accessible via `this`.

Extension may implement all 7 events or just one. Available events are these:

- `init` -  called just once
- `load (ajaxHandler)` - may be called more times (called at the end of `init()` method automatically)
- `before (ui)` - called before AJAX request is created
- `start (req)` - called immediatelly after creation of request
- `success (payload)` - called after successful request
- `complete` - called after any request
- `error` - called after failed request

Event callbacks receive arguments as shown in parentheses. All of them also get instance of plugin itself as last argument. That means both markups are equivalent:

```js
success: function () {
	$.nette.load();
}
```

```js
success: function (payload, nette) {
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

### Abort

User can abort running request by pressing Escape.

### Init

Special extension with default ajaxifying implementation. `init()` called with arguments will override it.
