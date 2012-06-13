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

* Alter the selectors via setting `$.nette.ext('init').linkSelector` or `$.nette.ext('init').formSelector` to whatever you wish.
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
- `before (settings, ui, e)` - called before AJAX request is created
- `start (jqXHR)` - called immediatelly after creation of request
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

Extension may be disabled by calling: `$.nette.ext('name', null);`. You can also modify it directly - just grab the instance of extension by calling `$.nette.ext('name');` without other arguments. Returned object is instance of context:

```js
// context of extension
$.nette.ext('unique');
```

## Default extensions

### Validation

Performs various checks of event causing the request:

- CTRL, ALT, SHIFT keys or middle mouse button will prevent ajaxification,
- absolute URLs and hash links will prevent ajaxification,
- also performs validation of submitted form.

Validation for element can be disabled by HTML 5 data attribute `data-ajax-validate="false"`. You may also switch various parts of validation in `ajax()` method by providing `validate` key in options. For example:

```js
$('#link').click(function (e) {
	$.nette.ajax({
		validate: {
			keys: false // CTRL, ALT etc. will not prevent ajaxification
		}
	}, this, e);
});
```

### Forms

Collects data from form elements including image button coordinates.

### Snippets

Ensures update of all invalidated snippets in DOM. Update routine can be altered by replacing any of 3 following methods:

- `updateSnippet` calls other methods, handles IE issues with `<title>` snippet.
- `getElement` implements default Nette implementation of snippets (name of snippet is its ID attribute).
- `applySnippet` best place for adding some animations etc. Default implementation just calls `.html()`.

### Redirect

If payload contains `redirect` key, JS will perform change of location.

### History

Takes care of saving the state to browser history if possible.

### Unique

Ensures there is always just one request running. When one request begins, previous one will be aborted.

### Abort

User can abort running request by pressing ESC.

### Init

Special extension with default ajaxifying implementation. `init()` called with arguments will override it. Default implementation provides following parameters:

- `linkSelector` for ajaxifying links
- `formSelector` for ajaxifying submitting of form and clicking on its submit buttons and image buttons
- `buttonSelector` for ajaxifying specific buttons in non-ajax forms

All ajaxified elements should be marked by CSS class `ajax`.
