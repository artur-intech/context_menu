# Context menu

This is a very minimalist context menu code snippets written in plain HTML, CSS and JavaScript. It isn't distributed through any package manager
since it has fewer than 100 lines of JS code, and doing so would be overkill.

Initially, it was a part of the [Stack Overflow question](https://stackoverflow.com/q/4909167/2987689), but later ended up in this repository.

## Usage

1. Include the JS module:
    ```javascript
    import { ContextMenu } from "context_menu.mjs";
    ```
    Tune the path to a file according to your environment.
2. Use `ContextMenu` class to create a new context menu:

```javascript
const menu = new ContextMenu({
    target: document.querySelector('.js-items-with-context-menu'),
    items: [{
        label: 'Edit', action: function () {
            console.log('Editing...');
        }
    },
    {
        label: 'Delete', action: function () {
            console.log('Deleting...');
        }
    }],
    beforeOpen: function (_contextMenuEvent) {
        console.log('beforeOpen callback');
        return true; // A callback must return true
    },
    onClose: function () {
        console.log('onClose callback');
    }
});
```

## Demo

See [demo application](demo/index.html)

## Browser support

It should work in any of the latest browsers.

## Customization

You can fully customize the menu by passing CSS code in a `css` property to a constructor. The provided CSS will be loaded after
the [defaults](context_menu.mjs#L6).

```javascript
const menu = new ContextMenu({
  css: `
    ul {
      background: black;
    }
  `
});
```
