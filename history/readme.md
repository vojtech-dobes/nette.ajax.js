# History Extesnion

Utilizes History API implemented in HTML 5.

## Installation

1. Link `history/history.ajax.js` after `nette.ajax.js`.
2. Register config extension in `app/bootstrap.php`:

```php
$configurator->onCompile[] = function ($configurator, $compiler) {
	$compiler->addExtension('ajax', new VojtechDobes\NetteAjax\Extension);
};
```

## Usage

Write your application as normal. All redirects and forwards will be properly handled.

To correctly update UI, use snippets. If you plan to ajaxify whole application, consider adding this snippet to your `beforeRender()` method in `BasePresenter`.

```php
if ($this->isAjax()) {
	$this->invalidateControl('title');
	$this->invalidateControl('content');
}
```

And `app/@layout.latte` might be upgraded accordingly:

```html
<title n:inner-snippet="title">...
```

```html
{snippet content}
{include content}
{/snippet}
```

## UI Caching

Extension will automatically cache your UI and restore it on *Back* and *Forward* buttons without communication with server. If you wish to call server on every *Back* and *Forward*, turn caching off.

```js
$.nette.ext('history').cache = false;
```
