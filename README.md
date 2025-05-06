# Context menu

This is a very minimalist context menu code snippets written in plain HTML, CSS and JavaScript. It isn't distributed through any package manager
since it has fewer than 100 lines of JS code, and doing so would be overkill.

Initially, it was a part of the [Stack Overflow question](https://stackoverflow.com/q/4909167/2987689), but later ended up in this repository.

# Features:
- Extremely lightweight (less than 200 lines of js code)
- Written in Vanilla JS, CSS and HTML
- Framework-independent, no third-party dependencies
- Fully customizable using plain CSS (you can add dark mode support by youself with [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme))
- No effects or animations

## Usage

1. Include the JS module:
    ```javascript
    import { ContextMenu } from "context_menu.mjs";
    ```
    Tune the path to a file according to your environment.
2. Use `ContextMenu` class to create a new context menu:

    ```javascript
    new ContextMenu({
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
        openCondition: function (targetElement) {
            console.log('beforeOpen callback');
            return true; // Must return true to open the menu.
        },
        onClose: function () {
            console.log('onClose callback');
        }
    });
    ```

    where:

    - `target` is a required instance of an [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) on which the `ContextMenu` listens
    for `contextmenu` events.
    - `items` is a required array of item objects in the form of `{ label: "", action: function(){} }`. At least one item is required.
    - `openCondition` is an optional function that must return a [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) to open the
    menu. Passes [`PointerEvent.target`](https://developer.mozilla.org/en-US/docs/Web/API/Event/target) of the `contextmenu` event handler as a first
    parameter. This callback function might be used to fetch data from an HTML element. See [multiple items demo](demo/multiple_items.html).
    - `onClose` is an optional function that is called when the menu is closed.

    Only one menu can be used at a time. The behavior of creating multiple `ContextMenu` objects is unexpected.

### Employ event bubbling using `target` and `openCondition`

While it's technically possible to use a context menu on a single element (i.e., one specified as the `target` parameter without any filtering in the
`openCondition` callback), typically it's designed for multiple elements. For example, this could apply to notes in a note-taking app, emails in an
email client, or similar list-based interfaces. To create a context menu for all items in a list, you should pass the container element holding the items
as the `target` parameter, then use the `openCondition` callback to filter which specific elements should trigger the menu:

```js
new ContextMenu({
    target: document.querySelector('.js-items-with-context-menu'),
    openCondition: function (target) {
        const matched = target.matches(".item");
        const id = target.dataset.id;

        // do something with the id

        return matched;
    }
});
```

This technique is based on [Event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling).

## Demo

See [demo directory](demo).

## Browser support

It should work in any of the latest browsers.

## Customization

You can fully customize the menu by passing CSS code in a `css` property to a constructor. The provided CSS will be loaded after
the [defaults](context_menu.mjs#L6).

```javascript
const menu = new ContextMenu({
  css: `
    // A container
    ul {
      background: black;
    }

    // An item
    li {
      color: white;
    }
  `
});
```
