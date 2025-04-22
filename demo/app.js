import { ContextMenu } from "../context_menu.mjs";

new ContextMenu({
    target: document.querySelector('.js-with-context-menu'),
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
    },
});
